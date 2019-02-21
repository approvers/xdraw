/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / htpps://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import Vector3 from '../../basis/Vector3';
import {packMesh} from './MeshUtils';

const SphereMesh =
    (radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0,
     phiLength = Math.PI * 2, thetaStart = 0,
     thetaLength = Math.PI) => (store: XStore, _transform: Transform) => {
      if (!store.hasBind('spheremesh.mode')) {
        store.addBind('spheremesh.radius', radius)
            .addBind(
                'spheremesh.widthSegments', widthSegments,
                (v: number) => Math.max(3, Math.floor(v) || 8))
            .addBind(
                'spheremesh.heightSegments', heightSegments,
                (v: number) => Math.max(2, Math.floor(v) || 6))
            .addBind('spheremesh.phiStart', phiStart)
            .addBind('spheremesh.phiLength', phiLength)
            .addBind('spheremesh.thetaStart', thetaStart)
            .addBind('spheremesh.thetaLength', thetaLength)
      }
      const self = store.getBindValues('spheremesh.');

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

          // vertex
          const x = -self.radius *
              Math.cos(self.phiStart + u * self.phiLength) *
              Math.sin(thetaStart + v * self.thetaLength);
          const y =
              self.radius * Math.cos(self.thetaStart + v * self.thetaLength);
          const z = self.radius * Math.sin(self.phiStart + u * self.phiLength) *
              Math.sin(thetaStart + v * self.thetaLength);

          vertex.push(x, y, z);

          // normal
          const normalV = new Vector3(x, y, z).normalize();
          normal.push(normalV.x, normalV.y, normalV.z);

          // uv
          uv.push(u, 1 - v);
          verticesRow.push(ix + iy);
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

          if (iy !== 0 || self.thetaStart > 0) index.push(a, b, d);
          if (iy !== self.heightSegments - 1 || self.thetaEnd < Math.PI)
            index.push(b, c, d);
        }
      }


      packMesh(store, {index, vertex, normal, uv});
      return store;
    }

export default SphereMesh;
