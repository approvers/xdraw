/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import { XStore } from '../../basis/Components';
import Transform from '../../basis/Transform';
import Vector3 from '../../basis/Vector3';
import BufferAttribute from '../../basis/BufferAttribute';
import { packMesh } from './MeshUtils';

function buildPlane(
  u: string, v: string, w: string, udir: number, vdir: number, width: number, height: number, depth: number, gridX: number, gridY: number, indices: number[], vertices: number[], normals: number[], uvs: number[]) {
  const segmentWidth = width / gridX;
  const segmentHeight = height / gridY;

  const widthHalf = width / 2;
  const heightHalf = height / 2;
  const depthHalf = depth / 2;

  const gridX1 = gridX + 1;
  const gridY1 = gridY + 1;

  const vector = new Vector3();

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

const BoxMesh = (width = 1, height = 1, depth = 1,
  widthSegments: number = 1, heightSegments: number = 1,
  depthSegments: number = 1
) => (store: XStore, _transform: Transform) => {

  if (!store.hasBind('props.boxmesh.mode')) {
    store.addBind('props.boxmesh.width', width)
      .addBind('props.boxmesh.height', height)
      .addBind('props.boxmesh.depth', depth)
      .addBind('props.boxmesh.widthSegments', widthSegments, (v: number) => Math.floor(v))
      .addBind('props.boxmesh.heightSegments', heightSegments, (v: number) => Math.floor(v))
      .addBind('props.boxmesh.depthSegments', depthSegments, (v: number) => Math.floor(v))
  }
  const self = store.getBindValues('props.boxmesh.');

  const indices: number[] = [], vertices: number[] = [], normals: number[] = [], uvs: number[] = [];

  // build each side of the box geometry
  buildPlane(
    'z', 'y', 'x', -1, -1, self.depth, self.height, self.width, self.depthSegments,
    self.heightSegments,
    indices, vertices, normals, uvs);  // px
  buildPlane(
    'z', 'y', 'x', 1, -1, self.depth, self.height, -self.width, self.depthSegments,
    self.heightSegments,
    indices, vertices, normals, uvs);  // nx
  buildPlane(
    'x', 'z', 'y', 1, 1, self.width, self.depth, self.height, self.widthSegments, self.depthSegments,
    indices, vertices, normals, uvs);  // py
  buildPlane(
    'x', 'z', 'y', 1, -1, self.width, self.depth, -self.height, self.widthSegments,
    self.depthSegments,
    indices, vertices, normals, uvs);  // ny
  buildPlane(
    'x', 'y', 'z', 1, -1, self.width, self.height, self.depth, self.widthSegments,
    self.heightSegments,
    indices, vertices, normals, uvs);  // pz
  buildPlane(
    'x', 'y', 'z', -1, -1, self.width, self.height, -self.depth, self.widthSegments,
    self.heightSegments,
    indices, vertices, normals, uvs);  // nz


  packMesh(store, indices, vertices, normals, uvs);
  return store;
}

export default BoxMesh;
