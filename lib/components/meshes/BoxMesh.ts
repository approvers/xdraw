/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import {packMesh} from './MeshUtils';

const BoxMesh =
    (width = 1, height = 1, depth = 1) => (
        store: XStore, _transform: Transform) => {
      if (!store.hasBind('boxmesh.mode')) {
        store.addBind('boxmesh.width', width)
            .addBind('boxmesh.height', height)
            .addBind('boxmesh.depth', depth);
      }
      const self = store.getBindValues('boxmesh.');

      // const indices: number[] = [0, 1, 3, 1, 2, 7, 2, 6, 1, 6, 5, 0, 5,
      // 4, 7, 0, 7, 6, 4, 6, 5];
      const vertices: number[] =
          [
            self.width,  self.height,  self.depth,   self.width,  -self.height,
            self.depth,  -self.width,  -self.height, self.depth,  -self.width,
            self.height, self.depth,   self.width,   self.height, -self.depth,
            self.width,  -self.height, -self.depth,  -self.width, -self.height,
            -self.depth, -self.width,  self.height,  -self.depth,
          ].map(e => e / 2),
                      normals: number[] = [], uvs: number[] = [];

      packMesh(store, {vertices, normals, uvs});
      return store;
    }

export default BoxMesh;
