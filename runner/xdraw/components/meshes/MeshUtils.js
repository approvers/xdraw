"use strict";
/**
  * @author RkEclair / https://github.com/RkEclair
  */
Object.defineProperty(exports, "__esModule", { value: true });
const BufferAttribute_1 = require("../../basis/BufferAttribute");
function packMesh(store, indices, vertices, normals, uvs) {
    const index = (indices.some((v) => v > 65535)) ?
        BufferAttribute_1.default.fromArray(Uint32Array, indices, 1)
        : BufferAttribute_1.default.fromArray(Uint16Array, indices, 1);
    store.set('mesh', {
        indices: index,
        position: BufferAttribute_1.default.fromArray(Float32Array, vertices, 3),
        normal: BufferAttribute_1.default.fromArray(Float32Array, normals, 3),
        uv: BufferAttribute_1.default.fromArray(Float32Array, uvs, 2)
    });
}
exports.packMesh = packMesh;
