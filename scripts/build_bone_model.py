import argparse
import json
import struct
from pathlib import Path

import numpy as np


def read_volumes(arguments):
    from py_aimio import read_aim

    bone, bone_metadata = read_aim(str(arguments.bone))
    energy, energy_metadata = read_aim(str(arguments.energy))
    for key in ("dimensions", "position", "offset", "element_size"):
        if bone_metadata[key] != energy_metadata[key]:
            raise ValueError(f"Volume geometry differs: {key}")
    mask = bone > 0
    if not np.isfinite(energy).all() or np.any(energy < 0):
        raise ValueError("SED must contain finite, nonnegative values")
    if not np.array_equal(mask, energy > 0):
        raise ValueError("Bone and SED masks differ")
    np.savez(arguments.volume, mask=mask, energy=energy,
             spacing=np.asarray(bone_metadata["element_size"]))


def write_glb(path, vertices, normals, faces, colors=None):
    binary = bytearray()
    views = []
    accessors = []

    def add_array(array, component_type, accessor_type, target, normalized=False):
        while len(binary) % 4:
            binary.append(0)
        offset = len(binary)
        binary.extend(array.tobytes())
        views.append({"buffer": 0, "byteOffset": offset,
                      "byteLength": array.nbytes, "target": target})
        accessor = {"bufferView": len(views) - 1, "componentType": component_type,
                    "count": len(array), "type": accessor_type}
        if normalized:
            accessor["normalized"] = True
        if accessor_type == "VEC3" and len(accessors) == 0:
            accessor.update(min=array.min(axis=0).tolist(), max=array.max(axis=0).tolist())
        accessors.append(accessor)
        return len(accessors) - 1

    attributes = {"POSITION": add_array(vertices, 5126, "VEC3", 34962),
                  "NORMAL": add_array(normals, 5126, "VEC3", 34962)}
    if colors is not None:
        attributes["COLOR_0"] = add_array(colors, 5121, "VEC4", 34962, True)
    indices = add_array(faces.flatten().astype("<u4"), 5125, "SCALAR", 34963)
    document = {
        "asset": {"version": "2.0", "generator": "Pediatric MSK Lab surface conversion"},
        "scene": 0, "scenes": [{"nodes": [0]}], "nodes": [{"mesh": 0}],
        "meshes": [{"primitives": [{"attributes": attributes, "indices": indices, "material": 0}]}],
        "materials": [{"doubleSided": True, "pbrMetallicRoughness": {
            "baseColorFactor": [1, 1, 1, 1] if colors is not None else [0.24, 0.20, 0.16, 1],
            "metallicFactor": 0, "roughnessFactor": 0.85}}],
        "buffers": [{"byteLength": len(binary)}], "bufferViews": views, "accessors": accessors,
    }
    json_bytes = json.dumps(document, separators=(",", ":")).encode()
    json_bytes += b" " * (-len(json_bytes) % 4)
    binary.extend(b"\0" * (-len(binary) % 4))
    total = 12 + 8 + len(json_bytes) + 8 + len(binary)
    path.write_bytes(struct.pack("<III", 0x46546C67, 2, total)
                     + struct.pack("<I4s", len(json_bytes), b"JSON") + json_bytes
                     + struct.pack("<I4s", len(binary), b"BIN\0") + binary)


def sample_energy(mask, energy, coordinates, sigma):
    from scipy.ndimage import gaussian_filter, map_coordinates

    weights = mask.astype(np.float32)
    values = np.where(mask, energy, 0)
    if sigma > 0:
        weights = gaussian_filter(weights, sigma=sigma, mode="constant", cval=0)
        values = gaussian_filter(values, sigma=sigma, mode="constant", cval=0)
    sampled_weights = map_coordinates(weights, coordinates, order=1, mode="constant", cval=0)
    sampled_values = map_coordinates(values, coordinates, order=1, mode="constant", cval=0)
    return np.divide(sampled_values, sampled_weights, out=np.zeros_like(sampled_values),
                     where=sampled_weights > 1e-6)


def build_surface(arguments):
    from matplotlib import colormaps
    from vtkmodules.vtkCommonDataModel import vtkImageData
    from vtkmodules.vtkFiltersCore import vtkFlyingEdges3D, vtkPolyDataNormals, vtkQuadricDecimation
    from vtkmodules.util.numpy_support import numpy_to_vtk, vtk_to_numpy

    data = np.load(arguments.volume)
    mask, energy, spacing = data["mask"], data["energy"], data["spacing"]
    cap = float(np.percentile(energy[mask], arguments.percentile))
    padded_mask = np.pad(mask.astype(np.uint8), 1)
    image = vtkImageData()
    image.SetDimensions(*padded_mask.shape[::-1])
    image.SetSpacing(*spacing)
    image.SetOrigin(*(-spacing))
    image.GetPointData().SetScalars(numpy_to_vtk(padded_mask.ravel(), deep=True))
    contour = vtkFlyingEdges3D()
    contour.SetInputData(image)
    contour.SetValue(0, 0.5)
    contour.Update()
    original_faces = contour.GetOutput().GetNumberOfCells()
    decimation = vtkQuadricDecimation()
    decimation.SetInputConnection(contour.GetOutputPort())
    decimation.SetTargetReduction(max(0, 1 - arguments.triangles / original_faces))
    decimation.VolumePreservationOn()
    decimation.Update()
    normal_filter = vtkPolyDataNormals()
    normal_filter.SetInputConnection(decimation.GetOutputPort())
    normal_filter.SplittingOff()
    normal_filter.ConsistencyOn()
    normal_filter.Update()
    surface = normal_filter.GetOutput()
    points = vtk_to_numpy(surface.GetPoints().GetData()).astype(np.float64)
    faces = vtk_to_numpy(surface.GetPolys().GetData()).reshape(-1, 4)[:, 1:].astype("<u4")
    normals = vtk_to_numpy(surface.GetPointData().GetNormals()).copy()
    coordinates = (points / spacing).T[::-1]
    sampled = sample_energy(mask, energy, coordinates, arguments.smoothing_sigma)
    color_rgb = colormaps["jet"](np.clip(sampled / cap, 0, 1))[:, :3]
    linear_rgb = np.where(color_rgb <= 0.04045, color_rgb / 12.92,
                          ((color_rgb + 0.055) / 1.055) ** 2.4)
    colors = np.column_stack((np.round(linear_rgb * 255).astype(np.uint8),
                              np.full(len(points), 255, dtype=np.uint8)))
    centre = (points.min(axis=0) + points.max(axis=0)) / 2
    vertices = ((points - centre)[:, [0, 2, 1]] / 1000).astype("<f4")
    vertices[:, 2] *= -1
    normals = normals[:, [0, 2, 1]].astype("<f4")
    normals[:, 2] *= -1
    arguments.output.mkdir(parents=True, exist_ok=True)
    write_glb(arguments.output / "bone-sed.glb", vertices, normals, faces, colors)
    write_glb(arguments.output / "bone-structure.glb", vertices, normals, faces)
    report = {"percentile": arguments.percentile, "color_map": "jet", "scale_min": 0, "scale_max": cap,
              "percentile_population": "all original unsmoothed bone voxels",
              "color_smoothing": "bone-mask-normalized Gaussian",
              "smoothing_sigma_voxels": arguments.smoothing_sigma,
              "geometry_smoothing": False, "original_triangles": original_faces,
              "triangles": len(faces), "vertices": len(vertices),
              "vertex_values_above_cap": int(np.count_nonzero(sampled > cap))}
    (arguments.output / "conversion.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report))


parser = argparse.ArgumentParser()
parser.add_argument("stage", choices=["read", "mesh"])
parser.add_argument("--bone", type=Path)
parser.add_argument("--energy", type=Path)
parser.add_argument("--volume", type=Path, required=True)
parser.add_argument("--output", type=Path)
parser.add_argument("--triangles", type=int, default=750000)
parser.add_argument("--percentile", type=float, default=99)
parser.add_argument("--smoothing-sigma", type=float, default=1.5)
arguments = parser.parse_args()
if not 0 < arguments.percentile <= 100:
    parser.error("--percentile must be greater than 0 and no greater than 100")
if arguments.smoothing_sigma < 0:
    parser.error("--smoothing-sigma must be nonnegative")
if arguments.stage == "read":
    read_volumes(arguments)
else:
    build_surface(arguments)
