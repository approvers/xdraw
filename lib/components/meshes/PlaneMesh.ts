/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {unmapBinds, XBind, XComponent, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';

import {packMesh} from './MeshUtils';

export default class PlaneMesh implements XComponent {
  binds;
  constructor(width = 1, height = 1) {
    this.binds = {width: new XBind(width), height: new XBind(height)};
  }
  /* Faces
  3_____0
  |     |
  |     |
  2_____1
  */
  update = [(store: XStore, _transform: Transform) => {
    const self = unmapBinds(this.binds);

    const index: number[] = [3, 2, 0, 0, 2, 1];
    const vertex: number[] = [
      self.width, self.height, 0, self.width, -self.height, 0, -self.width,
      -self.height, 0, -self.width, self.height, 0
    ].map(e => e / 2);
    const normal: number[] = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    const uv: number[] = [1, 0, 1, 1, 0, 0, 0, 1];

    packMesh(
        store, {indices: index, vertices: vertex, normals: normal, uvs: uv});
  }];
}