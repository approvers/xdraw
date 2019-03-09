/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {unmapBinds, XBind, XBindMap, XComponent, XStore} from '../../basis/Components';
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

  /* Face
              2_____3_____0
              |     |     |
              |     |     |
  3_____2_____6_____7_____4
x |     |     |     |
| |     |     |     |
v 0_____1_____5_____4
<-y           |     |
              |     |
    +z<-|->-z 1_____0
  */
  update = [(store: XStore, _transform: Transform) => {
    const self = unmapBinds(this.binds);

    const indices: number[] = [
      3, 0, 2, 2, 0, 1, 2, 1, 6, 6, 1, 5, 5, 1, 4, 4, 1, 0,
      6, 5, 7, 7, 5, 4, 2, 6, 3, 3, 6, 7, 3, 7, 0, 0, 7, 4
    ];
    const sqrt3 = 0.5773502691896258;
    const vertices: number[] =
        [
          self.width,  self.height,  self.depth,   self.width,  -self.height,
          self.depth,  -self.width,  -self.height, self.depth,  -self.width,
          self.height, self.depth,   self.width,   self.height, -self.depth,
          self.width,  -self.height, -self.depth,  -self.width, -self.height,
          -self.depth, -self.width,  self.height,  -self.depth,
        ].map(e => e / 2),
                    normals: number[] =
                        [
                          1, 1, 1,  1, -1, 1,  -1, -1, 1,  -1, 1, 1,
                          1, 1, -1, 1, -1, -1, -1, -1, -1, -1, 1, -1
                        ].map(e => e * -sqrt3),
                    uvs: number[] = [];

    packMesh(store, {indices, vertices, normals, uvs});
  }];
}
