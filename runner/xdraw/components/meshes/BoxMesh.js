"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("../../basis/Vector3");
const MeshUtils_1 = require("./MeshUtils");
function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, indices, vertices, normals, uvs) {
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;
    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const depthHalf = depth / 2;
    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;
    const vector = new Vector3_1.default();
    // generate vertices, normals and uvs
    for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segmentHeight - heightHalf;
        for (let ix = 0; ix < gridX1; ix++) {
            const x = ix * segmentWidth - widthHalf;
            // set values to correct vector component
            vector[u] = x * udir;
            vector[v] = y * vdir;
            vector[w] = depthHalf;
            // now apply vector to vertex buffer
            vertices.push(...vector.toArray());
            // set values to correct vector component
            vector[u] = 0;
            vector[v] = 0;
            vector[w] = depth > 0 ? 1 : -1;
            // now apply vector to normal buffer
            normals.push(...vector.toArray());
            // uvs
            uvs.push(ix / gridX, 1 - iy / gridY);
        }
    }
    // indices
    // 1. you need three indices to draw a single face
    // 2. a single segment consists of two faces
    // 3. so we need to generate six (2*3) indices per segment
    const indexOffset = indices.length + gridY * gridX;
    for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
            const a = indexOffset + ix + gridX1 * iy;
            const b = indexOffset + ix + gridX1 * (iy + 1);
            const c = indexOffset + (ix + 1) + gridX1 * (iy + 1);
            const d = indexOffset + (ix + 1) + gridX1 * iy;
            // faces
            indices.push(a, b, d);
            indices.push(b, c, d);
        }
    }
}
const BoxMesh = (width = 1, height = 1, depth = 1, widthSegments = 1, heightSegments = 1, depthSegments = 1) => (store, _transform) => {
    if (!store.hasBind('boxmesh.mode')) {
        store.addBind('boxmesh.width', width)
            .addBind('boxmesh.height', height)
            .addBind('boxmesh.depth', depth)
            .addBind('boxmesh.widthSegments', widthSegments, (v) => Math.floor(v))
            .addBind('boxmesh.heightSegments', heightSegments, (v) => Math.floor(v))
            .addBind('boxmesh.depthSegments', depthSegments, (v) => Math.floor(v));
    }
    const self = store.getBindValues('boxmesh.');
    const indices = [], vertices = [], normals = [], uvs = [];
    // build each side of the box geometry
    buildPlane('z', 'y', 'x', -1, -1, self.depth, self.height, self.width, self.depthSegments, self.heightSegments, indices, vertices, normals, uvs); // px
    buildPlane('z', 'y', 'x', 1, -1, self.depth, self.height, -self.width, self.depthSegments, self.heightSegments, indices, vertices, normals, uvs); // nx
    buildPlane('x', 'z', 'y', 1, 1, self.width, self.depth, self.height, self.widthSegments, self.depthSegments, indices, vertices, normals, uvs); // py
    buildPlane('x', 'z', 'y', 1, -1, self.width, self.depth, -self.height, self.widthSegments, self.depthSegments, indices, vertices, normals, uvs); // ny
    buildPlane('x', 'y', 'z', 1, -1, self.width, self.height, self.depth, self.widthSegments, self.heightSegments, indices, vertices, normals, uvs); // pz
    buildPlane('x', 'y', 'z', -1, -1, self.width, self.height, -self.depth, self.widthSegments, self.heightSegments, indices, vertices, normals, uvs); // nz
    MeshUtils_1.packMesh(store, indices, vertices, normals, uvs);
    return store;
};
exports.default = BoxMesh;
