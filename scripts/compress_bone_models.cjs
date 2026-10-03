const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

function readGlb(filename) {
  const bytes = fs.readFileSync(filename);
  assert.equal(bytes.readUInt32LE(0), 0x46546c67, 'Expected a binary glTF file');
  assert.equal(bytes.readUInt32LE(4), 2, 'Expected glTF version 2');
  assert.equal(bytes.readUInt32LE(8), bytes.length, 'Invalid glTF length');
  const jsonLength = bytes.readUInt32LE(12);
  const document = JSON.parse(bytes.subarray(20, 20 + jsonLength));
  assert.equal(document.buffers.length, 1, 'Expected one embedded buffer');
  assert(!document.buffers[0].uri, 'External buffers are not supported');
  assert(!document.extensionsRequired?.length, 'Compress an uncompressed source model');
  return { bytes, document, binary: bytes.subarray(28 + jsonLength) };
}

function writeGlb(document, binary) {
  const json = Buffer.from(JSON.stringify(document));
  const jsonLength = (json.length + 3) & ~3;
  const binaryLength = (binary.length + 3) & ~3;
  const output = Buffer.alloc(28 + jsonLength + binaryLength);
  output.writeUInt32LE(0x46546c67, 0);
  output.writeUInt32LE(2, 4);
  output.writeUInt32LE(output.length, 8);
  output.writeUInt32LE(jsonLength, 12);
  output.writeUInt32LE(0x4e4f534a, 16);
  output.fill(0x20, 20, 20 + jsonLength);
  json.copy(output, 20);
  output.writeUInt32LE(binaryLength, 20 + jsonLength);
  output.writeUInt32LE(0x004e4942, 24 + jsonLength);
  binary.copy(output, 28 + jsonLength);
  return output;
}

async function main() {
  const [packageDirectory, inputDirectory, outputDirectory] = process.argv.slice(2);
  assert(packageDirectory && inputDirectory && outputDirectory,
    'Usage: node scripts/compress_bone_models.cjs <meshoptimizer-package> <original-models> <output-models>');
  const packagePath = path.resolve(packageDirectory);
  assert.equal(require(path.join(packagePath, 'package.json')).version, '0.24.0');
  const encoder = require(path.join(packagePath, 'meshopt_encoder.js'));
  const decoder = require(path.join(packagePath, 'meshopt_decoder.js'));
  await Promise.all([encoder.ready, decoder.ready]);
  fs.mkdirSync(outputDirectory, { recursive: true });

  for (const filename of ['bone-sed.glb', 'bone-structure.glb']) {
    const source = readGlb(path.join(inputDirectory, filename));
    const document = structuredClone(source.document);
    const chunks = [];
    let compressedOffset = 0;

    document.bufferViews = document.bufferViews.map((view, index) => {
      const accessors = document.accessors.filter(accessor => accessor.bufferView === index);
      assert.equal(accessors.length, 1, 'Expected a dedicated buffer view per accessor');
      const accessor = accessors[0];
      assert(!accessor.byteOffset && !accessor.sparse, 'Expected contiguous accessor data');
      const stride = view.byteLength / accessor.count;
      const mode = view.target === 34963 ? 'INDICES' : 'ATTRIBUTES';
      const original = source.binary.subarray(view.byteOffset || 0, (view.byteOffset || 0) + view.byteLength);
      const encoded = encoder.encodeGltfBuffer(original, accessor.count, stride, mode);
      const decoded = new Uint8Array(view.byteLength);
      decoder.decodeGltfBuffer(decoded, accessor.count, stride, encoded, mode);
      assert.deepEqual(Buffer.from(decoded), original, `${filename}: buffer ${index} must remain byte-exact`);
      const padded = Buffer.alloc((encoded.length + 3) & ~3);
      padded.set(encoded);
      chunks.push(padded);
      const compressedView = {
        ...view,
        buffer: 1,
        extensions: {
          EXT_meshopt_compression: {
            buffer: 0,
            byteOffset: compressedOffset,
            byteLength: encoded.length,
            byteStride: stride,
            count: accessor.count,
            mode,
          },
        },
      };
      compressedOffset += padded.length;
      return compressedView;
    });

    const binary = Buffer.concat(chunks);
    document.buffers = [
      { byteLength: binary.length },
      { byteLength: source.document.buffers[0].byteLength,
        extensions: { EXT_meshopt_compression: { fallback: true } } },
    ];
    document.extensionsUsed = ['EXT_meshopt_compression'];
    document.extensionsRequired = ['EXT_meshopt_compression'];
    const output = writeGlb(document, binary);
    assert(output.length < source.bytes.length, 'Compression must reduce the file size');
    fs.writeFileSync(path.join(outputDirectory, filename), output);
    console.log(`${filename}: ${(source.bytes.length / 1e6).toFixed(2)} → ${(output.length / 1e6).toFixed(2)} MB; all buffers verified byte-exact`);
  }
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
