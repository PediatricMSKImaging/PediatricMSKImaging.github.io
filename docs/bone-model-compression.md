# Homepage bone model assets

The homepage models use lossless `EXT_meshopt_compression`, decoded by a locally
hosted Meshoptimizer 0.24.0 decoder. Geometry, normals, indices, and SED colours
are preserved byte-for-byte. There is no quantization or mesh simplification;
the 99th-percentile SED range and existing smoothing are unchanged.

To regenerate, first run the existing `scripts/build_bone_model.py` conversion
into a separate directory. Obtain `meshoptimizer@0.24.0` from the npm registry
and verify its registry SHA-512 integrity before extracting the package. Run:

```bash
node scripts/compress_bone_models.cjs /path/to/meshoptimizer/package /path/to/original-models models
```

The compressor checks each buffer against its decompressed output before writing
the models. Use original, uncompressed GLBs as inputs; already-compressed inputs
are rejected. Keep `assets/vendor/meshopt/meshopt_decoder.js` and its MIT license
from the same package version. Bump model URL versions when replacing assets.

`images/bone-sed-poster.webp` is a screenshot of the original model in its initial
homepage orientation, not a generated or modified scientific rendering. It
appears while the interactive model loads and is automatically replaced once
the model is ready. Regenerate the poster if the initial pose or SED colours change.
