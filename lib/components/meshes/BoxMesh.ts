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
              1_____0_____3_____2
              |     |     |     |
              |     |     |     |
  0_____1_____5_____4_____7_____6
x |     |     |     |
| |     |     |     |
v 3_____2_____6_____7
<-y
      +z<- | ->-z
  */
  update = [(store: XStore, _transform: Transform) => {
    const self = unmapBinds(this.binds);

    const indices: number[] = [
      0, 3, 1, 1, 3, 2, 1, 2, 5, 5, 2, 6, 5, 6, 4, 4, 6, 7,
      1, 5, 0, 0, 5, 4, 0, 4, 3, 3, 4, 7, 3, 7, 2, 2, 7, 6
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
