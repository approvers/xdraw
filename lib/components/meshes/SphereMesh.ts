/**
 * @author mrdoob / http://mrdoob.com/
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author Mugen87 / https://github.com/Mugen87
 * @author MikuroXina / htpps://github.com/MikuroXina
 */

import {Component, rangeClamper} from '../../basis/Components';
import Transform from '../../basis/Transform';
import Vector3 from '../../basis/Vector3';

import {packMesh} from './MeshUtils';

export type SphereMeshProps = {
  radius: number,
  widthSegments: number,
  heightSegments: number,
  phiOffset: number,
  phiLength: number,
  thetaOffset: number,
  thetaLength: number,
};

const clampers = {
  radius: (v: number) => Math.max(v, 0),
  widthSegments: (v: number) => Math.max(Math.floor(v), 3),
  heightSegments: (v: number) => Math.max(Math.floor(v), 2),
  phiOffset: rangeClamper(0, 2 * Math.PI),
  phiLength: rangeClamper(0, 2 * Math.PI),
  thetaOffset: rangeClamper(0, Math.PI),
  thetaLength: rangeClamper(0, Math.PI)
};

export default class SphereMesh implements Component<SphereMeshProps> {
  defaultProps: SphereMeshProps;

  constructor(
      radius = 1, widthSegments = 8, heightSegments = 6, phiOffset = 0,
      phiLength = Math.PI * 2, thetaOffset = 0, thetaLength = Math.PI) {
    this.defaultProps = {
      radius,
      widthSegments,
      heightSegments,
      phiOffset,
      phiLength,
      thetaOffset,
      thetaLength
    };
  }

  run(_transform: Transform, props: SphereMeshProps) {
    let indexCount = 0;
    const grid: number[][] = [];

    // buffers
    const index: number[] = [];
    const vertex: number[] = [];
    const normal: number[] = [];
    const uv: number[] = [];

    // generate vertices, normal and uv
    for (let iy = 0; iy <= props.heightSegments; iy++) {
      const verticesRow: number[] = [];
      const v = iy / props.heightSegments;

      for (let ix = 0; ix <= props.widthSegments; ix++) {
        const u = ix / props.widthSegments;
        const phi = props.phiOffset + u * props.phiLength,
              theta = props.thetaOffset + v * props.thetaLength;

        // vertex
        const x = -props.radius * Math.cos(phi) * Math.sin(theta);
        const y = props.radius * Math.cos(theta);
        const z = props.radius * Math.sin(phi) * Math.sin(theta);

        vertex.push(x, y, z);

        // normal
        const normalV = new Vector3(x, y, z).normalize();
        normal.push(normalV.x, normalV.y, normalV.z);

        // uv
        uv.push(u, 1 - v);
        verticesRow.push(indexCount++);
      }
      grid.push(verticesRow);
    }

    // index
    for (let iy = 0; iy < props.heightSegments; iy++) {
      for (let ix = 0; ix < props.widthSegments; ix++) {
        const a = grid[iy][ix + 1];
        const b = grid[iy][ix];
        const c = grid[iy + 1][ix];
        const d = grid[iy + 1][ix + 1];

        if (iy !== 0 || props.thetaOffset > 0) index.push(a, b, d);
        if (iy !== props.heightSegments - 1 || props.thetaLength < Math.PI)
          index.push(b, c, d);
      }
    }

    packMesh(
        this, {indices: index, vertices: vertex, normals: normal, uvs: uv});
  }
}
