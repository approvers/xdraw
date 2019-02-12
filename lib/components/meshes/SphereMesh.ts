/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / htpps://github.com/RkEclair
 */

import BufferMesh from './BufferMesh';
import BufferAttribute from '../basis/BufferAttribute';
import Vector3 from '../basis/Vector3';

export default class SphereMesh extends BufferMesh {
  constructor(radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) {
    super();

    widthSegments = Math.max(3, Math.floor(widthSegments) || 8);
    heightSegments = Math.max(2, Math.floor(heightSegments) || 6);

    const thetaEnd = thetaStart + thetaLength;

    let index = 0;
    const grid: number[][] = [];

    const vertex = new Vector3();

    // buffers

    const indices: number[] = [];
    const vertices: number[] = [];
    const normals: number[] = [];
    const uvs: number[] = [];

    // generate vertices, normals and uvs

    for (let iy = 0; iy <= heightSegments; iy++) {

      const verticesRow: number[] = [];

      const v = iy / heightSegments;

      for (let ix = 0; ix <= widthSegments; ix++) {

        const u = ix / widthSegments;

        // vertex

        vertex.x = - radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
        vertex.y = radius * Math.cos(thetaStart + v * thetaLength);
        vertex.z = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

        vertices.push(vertex.x, vertex.y, vertex.z);

        // normal

        const normal = new Vector3(vertex.x, vertex.y, vertex.z).normalize();
        normals.push(normal.x, normal.y, normal.z);

        // uv

        uvs.push(u, 1 - v);

        verticesRow.push(index++);

      }

      grid.push(verticesRow);

    }

    // indices
    for (let iy = 0; iy < heightSegments; iy++) {

      for (let ix = 0; ix < widthSegments; ix++) {

        var a = grid[iy][ix + 1];
        var b = grid[iy][ix];
        var c = grid[iy + 1][ix];
        var d = grid[iy + 1][ix + 1];

        if (iy !== 0 || thetaStart > 0) indices.push(a, b, d);
        if (iy !== heightSegments - 1 || thetaEnd < Math.PI) indices.push(b, c, d);

      }

    }

    // build geometry

    this.setIndex(indices);
    this.addAttribute('position', BufferAttribute.fromArray(Float32Array, vertices, 3));
    this.addAttribute('normal', BufferAttribute.fromArray(Float32Array, normals, 3));
    this.addAttribute('uv', BufferAttribute.fromArray(Float32Array, uvs, 2));
  }
}
