/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import {packMesh} from './MeshUtils';

const PlaneMesh =
    (width: number = 1, height: number = 1, widthSegments: number = 1,
     heightSegments: number = 1) => (store: XStore, _transform: Transform) => {
      if (!store.hasBind('planemesh.mode')) {
        store.addBind('planemesh.width', width)
            .addBind('planemesh.height', height)
            .addBind(
                'planemesh.widthSegments', widthSegments,
                (v: number) => Math.max(3, Math.floor(v)))
            .addBind(
                'planemesh.heightSegments', heightSegments,
                (v: number) => Math.max(2, Math.floor(v)))
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
      const index: number[] = [];
      const vertex: number[] = [];
      const normal: number[] = [];
      const uv: number[] = [];

      // generate vertex, normal and uv
      for (let iy = 0; iy < gridY1; iy++) {
        const y = iy * segment_height - height_half;
        for (let ix = 0; ix < gridX1; ix++) {
          const x = ix * segment_width - width_half;

          vertex.push(x, -y, 0);

          normal.push(0, 0, 1);

          uv.push(ix / gridX);
          uv.push(1 - (iy / gridY));
        }
      }

      // index
      for (let iy = 0; iy < gridY; iy++) {
        for (let ix = 0; ix < gridX; ix++) {
          const a = ix + gridX1 * iy;
          const b = ix + gridX1 * (iy + 1);
          const c = (ix + 1) + gridX1 * (iy + 1);
          const d = (ix + 1) + gridX1 * iy;

          // faces
          index.push(a, b, d);
          index.push(b, c, d);
        }
      }

      packMesh(store, {index, vertex, normal, uv});
      return store;
    };

export default PlaneMesh;
