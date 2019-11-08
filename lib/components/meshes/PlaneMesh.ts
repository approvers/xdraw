/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Component} from '../../basis/Components';
import Transform from '../../basis/Component';

import {packMesh} from './MeshUtils';

type PlaneMeshProps = {
  width: number; height: number;
}

export default class PlaneMesh implements Component<PlaneMeshProps> {
  defaultProps: PlaneMeshProps;

  constructor(width = 1, height = 1) {
    this.defaultProps = {width, height};
  }
  /* Faces
  3_____0
  |     |
  |     |
  2_____1
  */
  run(_transform: Transform, props: PlaneMeshProps) {
    const index: number[] = [3, 2, 0, 0, 2, 1];
    const vertex: number[] = [
      props.width, props.height, 0, props.width, -props.height, 0, -props.width,
      -props.height, 0, -props.width, props.height, 0
    ].map(e => e / 2);
    const normal: number[] = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    const uv: number[] = [1, 0, 1, 1, 0, 0, 0, 1];

    packMesh(
        this, {indices: index, vertices: vertex, normals: normal, uvs: uv});
  }
}