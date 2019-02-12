/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / htpps://github.com/RkEclair
 */

import { XStore } from '../../basis/Components';
import Transform from '../../basis/Transform';
import BufferAttribute from '../../basis/BufferAttribute';
import Vector3 from '../../basis/Vector3';
import { packMesh } from './MeshUtils';

const SphereMesh = (radius = 1, widthSegments = 8, heightSegments = 6, phiStart = 0, phiLength = Math.PI * 2, thetaStart = 0, thetaLength = Math.PI) => (store: XStore, _transform: Transform) => {

  if (!store.hasBind('props.spheremesh.mode')) {
    store.addBind('props.spheremesh.radius', radius)
      .addBind('props.spheremesh.widthSegments', widthSegments, (v: number) => Math.max(3, Math.floor(v) || 8))
      .addBind('props.spheremesh.heightSegments', heightSegments, (v: number) => Math.max(2, Math.floor(v) || 6))
      .addBind('props.spheremesh.phiStart', phiStart)
      .addBind('props.spheremesh.phiLength', phiLength)
      .addBind('props.spheremesh.thetaStart', thetaStart)
      .addBind('props.spheremesh.thetaLength', thetaLength)
  }
  const self = store.getBindValues('props.spheremesh.');

  let index = 0;
  const grid: number[][] = [];

  // buffers
  const indices: number[] = [];
  const vertices: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  // generate vertices, normals and uvs
  for (let iy = 0; iy <= self.heightSegments; iy++) {
    const verticesRow: number[] = [];
    const v = iy / self.heightSegments;

    for (let ix = 0; ix <= self.widthSegments; ix++) {
      const u = ix / self.widthSegments;

      // vertex
      const x = - self.radius * Math.cos(self.phiStart + u * self.phiLength) * Math.sin(thetaStart + v * self.thetaLength);
      const y = self.radius * Math.cos(self.thetaStart + v * self.thetaLength);
      const z = self.radius * Math.sin(self.phiStart + u * self.phiLength) * Math.sin(thetaStart + v * self.thetaLength);

      vertices.push(x, y, z);

      // normal
      const normal = new Vector3(x, y, z).normalize();
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

      if (iy !== 0 || self.thetaStart > 0) indices.push(a, b, d);
      if (iy !== self.heightSegments - 1 || self.thetaEnd < Math.PI) indices.push(b, c, d);
    }
  }


  packMesh(store, indices, vertices, normals, uvs);
  return store;
}

export default SphereMesh;
