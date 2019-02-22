/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import Vector3 from '../../basis/Vector3';
import {packMesh} from './MeshUtils';

function buildPlane(
    u: string, v: string, w: string, udir: number, vdir: number, width: number,
    height: number, depth: number, gridX: number, gridY: number,
    index: number[], vertex: number[], normal: number[], uv: number[]) {
  const segmentWidth = width / gridX;
  const segmentHeight = height / gridY;

  const widthHalf = width / 2;
  const heightHalf = height / 2;
  const depthHalf = depth / 2;

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const vector = new Vector3();

  // generate vertex, normal and uv
  for (let iy = 0; iy < gridY1; iy++) {
    const y = iy * segmentHeight - heightHalf;

    for (let ix = 0; ix < gridX1; ix++) {
      const x = ix * segmentWidth - widthHalf;

      // set values to correct vector component
      vector[u] = x * udir;
      vector[v] = y * vdir;
      vector[w] = depthHalf;

      // now apply vector to vertex buffer
      vertex.push(...vector.toArray());

      // set values to correct vector component
      vector[u] = 0;
      vector[v] = 0;
      vector[w] = depth > 0 ? 1 : -1;

      // now apply vector to normal buffer
      normal.push(...vector.toArray());

      // uv
      uv.push(ix / gridX, 1 - iy / gridY);
    }
  }

  // index

  // 1. you need three index to draw a single face
  // 2. a single segment consists of two faces
  // 3. so we need to generate six (2*3) index per segment
  const indexOffset = index.length + gridY * gridX;
  for (let iy = 0; iy < gridY; iy++) {
    for (let ix = 0; ix < gridX; ix++) {
      const a = indexOffset + ix + gridX1 * iy;
      const b = indexOffset + ix + gridX1 * (iy + 1);
      const c = indexOffset + (ix + 1) + gridX1 * (iy + 1);
      const d = indexOffset + (ix + 1) + gridX1 * iy;

      // faces
      index.push(a, b, d);
      index.push(b, c, d);
    }
  }
}

const BoxMesh =
    (width = 1, height = 1, depth = 1) => (
        store: XStore, _transform: Transform) => {
      if (!store.hasBind('boxmesh.mode')) {
        store.addBind('boxmesh.width', width)
            .addBind('boxmesh.height', height)
            .addBind('boxmesh.depth', depth);
      }
      const self = store.getBindValues('boxmesh.');

      const index: number[] =
          [0, 1, 3, 1, 2, 7, 2, 6, 1, 6, 5, 0, 5, 4, 7, 0, 7, 6, 4, 6, 5],
                   vertex: number[] =
                       [
                         self.width,  self.height, self.depth,   -self.width,
                         self.height, self.depth,  -self.width,  -self.height,
                         self.depth,  self.width,  -self.height, self.depth,
                         self.width,  self.height, -self.depth,  -self.width,
                         self.height, -self.depth, -self.width,  -self.height,
                         -self.depth, self.width,  -self.height, -self.depth,
                       ],
                   normal: number[] = [], uv: number[] = [];

      packMesh(store, {index, vertex, normal, uv});
      return store;
    }

export default BoxMesh;
