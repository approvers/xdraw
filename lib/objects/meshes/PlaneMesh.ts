/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 */

import BufferMesh from '../BufferMesh';
import BufferAttribute from '../../basis/BufferAttribute';

export default class PlaneMesh extends BufferMesh {

  constructor(width: number = 1, height: number = 1, widthSegments: number = 1, heightSegments: number = 1) {
    super();

    const width_half = width / 2;
    const height_half = height / 2;

    const gridX = Math.max(Math.floor(widthSegments), 1);
    const gridY = Math.max(Math.floor(heightSegments), 1);

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    const segment_width = width / gridX;
    const segment_height = height / gridY;

    // buffers

    const indices = [];
    const vertices = [];
    const normals = [];
    const uvs = [];

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

    // build geometry

    this.setIndex(indices);
    this.addAttribute('position', BufferAttribute.fromArray(Uint32Array, vertices, 3));
    this.addAttribute('normal', BufferAttribute.fromArray(Uint32Array, normals, 3));
    this.addAttribute('uv', BufferAttribute.fromArray(Uint32Array, uvs, 2));

  }
}
