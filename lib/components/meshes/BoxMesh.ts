/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {XBind, XBindMap, XComponent, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';

import {packMesh} from './MeshUtils';

export default class BoxMesh implements XComponent {
  binds: XBindMap;
  constructor(width = 1, height = 1, depth = 1) {
    this.binds = {
      width: new XBind(width),
      height: new XBind(height),
      depth: new XBind(depth)
    };
  }

  update(store: XStore, _transform: Transform) {
    const self = Object.entries(this.binds).reduce((prev, e) => {
      prev[e[0]] = e[1].get();
      return prev;
    }, {}) as {[key: string]: number};

    const indices: number[] = [0, 1, 2, 3, 7, 1, 6, 4, 7, 5, 2, 4, 0, 1];
    const vertices: number[] =
        [
          self.width,  self.height,  self.depth,   self.width,  -self.height,
          self.depth,  -self.width,  -self.height, self.depth,  -self.width,
          self.height, self.depth,   self.width,   self.height, -self.depth,
          self.width,  -self.height, -self.depth,  -self.width, -self.height,
          -self.depth, -self.width,  self.height,  -self.depth,
        ].map(e => e / 2),
                    normals: number[] = [], uvs: number[] = [];

    packMesh(store, {indices, vertices, normals, uvs});
  }
}
