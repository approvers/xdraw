"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const MeshUtils_1 = require("./MeshUtils");
const PlaneMesh = (width = 1, height = 1, widthSegments = 1, heightSegments = 1) => (store, _transform) => {
    if (!store.hasBind('planemesh.mode')) {
        store.addBind('planemesh.width', width)
            .addBind('planemesh.height', height)
            .addBind('planemesh.widthSegments', widthSegments, (v) => Math.max(3, Math.floor(v)))
            .addBind('planemesh.heightSegments', heightSegments, (v) => Math.max(2, Math.floor(v)));
    }
    const self = store.getBindValues('planemesh.');
    const width_half = self.width / 2;
    const height_half = self.height / 2;
    const gridX = self.widthSegments;
    const gridY = self.heightSegments;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const segment_width = self.width / gridX;
    const segment_height = self.height / gridY;
    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    // generate vertices, normals and uvs
    for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segment_height - height_half;
        for (let ix = 0; ix < gridX1; ix++) {
            const x = ix * segment_width - width_half;
            vertices.push(x, -y, 0);
            normals.push(0, 0, 1);
            uvs.push(ix / gridX);
            uvs.push(1 - (iy / gridY));
        }
    }
    // indices
    for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
            const a = ix + gridX1 * iy;
            const b = ix + gridX1 * (iy + 1);
            const c = (ix + 1) + gridX1 * (iy + 1);
            const d = (ix + 1) + gridX1 * iy;
            // faces
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
    MeshUtils_1.packMesh(store, indices, vertices, normals, uvs);
    return store;
};
exports.default = PlaneMesh;
