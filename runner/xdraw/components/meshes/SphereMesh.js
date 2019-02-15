"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / htpps://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("../../basis/Vector3");
const MeshUtils_1 = require("./MeshUtils");
const SphereMesh = (radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) => (store, _transform) => {
    if (!store.hasBind('spheremesh.mode')) {
        store.addBind('spheremesh.radius', radius)
            .addBind('spheremesh.widthSegments', widthSegments, (v) => Math.max(3, Math.floor(v) || 8))
            .addBind('spheremesh.heightSegments', heightSegments, (v) => Math.max(2, Math.floor(v) || 6))
            .addBind('spheremesh.phiStart', phiStart)
            .addBind('spheremesh.phiLength', phiLength)
            .addBind('spheremesh.thetaStart', thetaStart)
            .addBind('spheremesh.thetaLength', thetaLength);
    }
    const self = store.getBindValues('spheremesh.');
    let index = 0;
    const grid = [];
    // buffers
    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];
    // generate vertices, normals and uvs
    for (let iy = 0; iy <= self.heightSegments; iy++) {
        const verticesRow = [];
        const v = iy / self.heightSegments;
        for (let ix = 0; ix <= self.widthSegments; ix++) {
            const u = ix / self.widthSegments;
            // vertex
            const x = -self.radius * Math.cos(self.phiStart + u * self.phiLength) * Math.sin(thetaStart + v * self.thetaLength);
            const y = self.radius * Math.cos(self.thetaStart + v * self.thetaLength);
            const z = self.radius * Math.sin(self.phiStart + u * self.phiLength) * Math.sin(thetaStart + v * self.thetaLength);
            vertices.push(x, y, z);
            // normal
            const normal = new Vector3_1.default(x, y, z).normalize();
            normals.push(normal.x, normal.y, normal.z);
            // uv
            uvs.push(u, 1 - v);
            verticesRow.push(index++);
        }
        grid.push(verticesRow);
    }
    // indices
    for (let iy = 0; iy < self.heightSegments; iy++) {
        for (let ix = 0; ix < self.widthSegments; ix++) {
            const a = grid[iy][ix + 1];
            const b = grid[iy][ix];
            const c = grid[iy + 1][ix];
            const d = grid[iy + 1][ix + 1];
            if (iy !== 0 || self.thetaStart > 0)
                indices.push(a, b, d);
            if (iy !== self.heightSegments - 1 || self.thetaEnd < Math.PI)
                indices.push(b, c, d);
        }
    }
    MeshUtils_1.packMesh(store, indices, vertices, normals, uvs);
    return store;
};
exports.default = SphereMesh;
