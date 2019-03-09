/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / htpps://github.com/RkEclair
 */

import {rangeClamper, unmapBinds, XBind, XComponent, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import Vector3 from '../../basis/Vector3';

import {packMesh} from './MeshUtils';

export default class SphereMesh implements XComponent {
  binds;

  constructor(
      radius = 1, widthSegments = 8, heightSegments = 6, phiOffset = 0,
      phiLength = Math.PI * 2, thetaOffset = 0, thetaLength = Math.PI) {
    this.binds = {
      radius: new XBind(radius, v => Math.max(v, 0)),
      widthSegments: new XBind(widthSegments, v => Math.max(Math.floor(v), 3)),
      heightSegments:
          new XBind(heightSegments, v => Math.max(Math.floor(v), 2)),
      phiOffset: new XBind(phiOffset, rangeClamper(0, 2 * Math.PI)),
      phiLength: new XBind(phiLength, rangeClamper(0, 2 * Math.PI)),
      thetaOffset: new XBind(thetaOffset, rangeClamper(0, Math.PI)),
      thetaLength: new XBind(thetaLength, rangeClamper(0, Math.PI))
    };
  }

  update = [(store: XStore, _transform: Transform) => {
    const self = unmapBinds(this.binds);

    const grid: number[][] = [];

    // buffers
    const index: number[] = [];
    const vertex: number[] = [];
    const normal: number[] = [];
    const uv: number[] = [];

    // generate vertices, normal and uv
    for (let iy = 0; iy <= self.heightSegments; iy++) {
      const verticesRow: number[] = [];
      const v = iy / self.heightSegments;

      for (let ix = 0; ix <= self.widthSegments; ix++) {
        const u = ix / self.widthSegments;
        const phi = self.phiOffset + u * self.phiLength,
              theta = self.thetaOffset + v * self.thetaLength;

        // vertex
        const x = -self.radius * Math.cos(phi) * Math.sin(theta);
        const y = self.radius * Math.cos(theta);
        const z = self.radius * Math.sin(phi) * Math.sin(theta);

        vertex.push(x, y, z);

        // normal
        const normalV = new Vector3(x, y, z).normalize();
        normal.push(normalV.x, normalV.y, normalV.z);

        // uv
        uv.push(u, 1 - v);
        verticesRow.push(ix * self.heightSegments + iy);
      }
      grid.push(verticesRow);
    }

    // index
    for (let iy = 0; iy < self.heightSegments; iy++) {
      for (let ix = 0; ix < self.widthSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        if (iy !== 0 || self.thetaOffset > 0) index.push(a, b, d);
        if (iy !== self.heightSegments - 1 || self.thetaEnd < Math.PI)
          index.push(b, c, d);
      }
    }

    packMesh(
        store, {indices: index, vertices: vertex, normals: normal, uvs: uv});
  }];
}
