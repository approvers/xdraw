/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author MikuroXina / htpps://github.com/MikuroXina
 */

import {rangeClamper} from '../../basis/Clampers';
import Vector3 from '../../basis/Vector3';
import Mesh from './Mesh';

export default class SphereMesh extends Mesh {
  constructor(
      radius = 1, widthSegments = 8, heightSegments = 6, phiOffset = 0,
      phiLength = Math.PI * 2, thetaOffset = 0, thetaLength = Math.PI) {
    super({
      radius: {initValue: radius, clamper: (v: number) => Math.max(v, 0)},
      widthSegments: {
        initValue: widthSegments,
        clamper: (v: number) => Math.max(Math.floor(v), 3)
      },
      heightSegments: {
        initValue: heightSegments,
        clamper: (v: number) => Math.max(Math.floor(v), 2)
      },
      phiOffset: {initValue: phiOffset, clamper: rangeClamper(0, 2 * Math.PI)},
      phiLength: {initValue: phiLength, clamper: rangeClamper(0, 2 * Math.PI)},
      thetaOffset:
          {initValue: thetaOffset, clamper: rangeClamper(0, 2 * Math.PI)},
      thetaLength:
          {initValue: thetaLength, clamper: rangeClamper(0, 2 * Math.PI)}
    });
  }

  run() {
    const radius = this.store.addProp('radius', 1);
    const widthSegments = this.store.addProp('widthSegments', 1);
    const heightSegments = this.store.addProp('heightSegments', 1);
    const phiOffset = this.store.addProp('phiOffset', 1);
    const phiLength = this.store.addProp('phiLength', 1);
    const thetaOffset = this.store.addProp('thetaOffset', 1);
    const thetaLength = this.store.addProp('thetaLength', 1);

    let indexCount = 0;
    const grid: number[][] = [];

    // buffers
    const index: number[] = [];
    const vertex: number[] = [];
    const normal: number[] = [];
    const uv: number[] = [];

    // generate vertices, normal and uv
    for (let iy = 0; iy <= heightSegments; iy++) {
      const verticesRow: number[] = [];
      const v = iy / heightSegments;

      for (let ix = 0; ix <= widthSegments; ix++) {
        const u = ix / widthSegments;
        const phi = phiOffset + u * phiLength,
              theta = thetaOffset + v * thetaLength;

        // vertex
        const x = -radius * Math.cos(phi) * Math.sin(theta);
        const y = radius * Math.cos(theta);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        vertex.push(x, y, z);

        // normal
        const normalV = new Vector3(x, y, z).normalize();
        normal.push(normalV.x, normalV.y, normalV.z);

        // uv
        uv.push(u, 1 - v);
        verticesRow.push(indexCount++);
      }
      grid.push(verticesRow);
    }

    // index
    for (let iy = 0; iy < heightSegments; iy++) {
      for (let ix = 0; ix < widthSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        if (iy !== 0 || thetaOffset > 0) index.push(a, b, d);
        if (iy !== heightSegments - 1 || thetaLength < Math.PI)
          index.push(b, c, d);
      }
    }

    this.packMesh({indices: index, vertices: vertex, normals: normal, uvs: uv});
  }
}
