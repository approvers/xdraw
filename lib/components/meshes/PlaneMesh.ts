/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from '../../basis/BufferAttribute';
import { XStore } from '../../basis/Components';
import Transform from '../../basis/Transform';
import { packMesh } from './MeshUtils';

const PlaneMesh = (width: number = 1, height: number = 1, widthSegments: number = 1, heightSegments: number = 1) => (store: XStore, _transform: Transform) => {

  if (!store.hasBind('props.planemesh.mode')) {
    store.addBind('props.planemesh.width', width)
      .addBind('props.planemesh.height', height)
      .addBind('props.planemesh.widthSegments', widthSegments, (v: number) => Math.max(3, Math.floor(v)))
      .addBind('props.planemesh.heightSegments', heightSegments, (v: number) => Math.max(2, Math.floor(v)))
  }
  const self = store.getBindValues('props.planemesh.');

  const width_half = self.width / 2;
  const height_half = self.height / 2;

  const gridX = self.widthSegments;
  const gridY = self.heightSegments;

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const segment_width = self.width / gridX;
  const segment_height = self.height / gridY;

  // buffers
  const indices: number[] = [];
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  // generate vertices, normals and uvs
  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segment_height - height_half;
    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segment_width - width_half;

      vertices.push(x, - y, 0);

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

  packMesh(store, indices, vertices, normals, uvs);
  return store;
};

export default PlaneMesh;
