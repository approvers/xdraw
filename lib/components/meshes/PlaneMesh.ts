/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {XBind, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';

import {packMesh} from './MeshUtils';

export default class PlaneMesh {
  binds;
  constructor() {
    this.binds = {
      lazy: new XBind(0),
    };
  }

  update = [(store: XStore, _transform: Transform) => {
    const index: number[] = [0, 2, 1, 1, 2, 3];
    const vertex: number[] =
        [0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, -0.5, 0, -0.5, 0.5, 0];
    const normal: number[] = [0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1];
    const uv: number[] = [1, 0, 1, 1, 0, 0, 0, 1];

    packMesh(
        store, {indices: index, vertices: vertex, normals: normal, uvs: uv});
  }];
}