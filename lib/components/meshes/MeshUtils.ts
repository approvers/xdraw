/**
  * @author RkEclair / https://github.com/RkEclair
  */

import { XStore } from "../../basis/Components";
import BufferAttribute from "../../basis/BufferAttribute";

export function packMesh(store: XStore, indices: number[], vertices: number[], normals: number[], uvs: number[]) {
  const index = (indices.some((v) => v > 65535)) ?
    BufferAttribute.fromArray(Uint32Array, indices, 1)
    : BufferAttribute.fromArray(Uint16Array, indices, 1);
  store.set('mesh', {
    indices: index,
    position: BufferAttribute.fromArray(Float32Array, vertices, 3),
    normal: BufferAttribute.fromArray(Float32Array, normals, 3),
    uv: BufferAttribute.fromArray(Float32Array, uvs, 2)
  });
}
