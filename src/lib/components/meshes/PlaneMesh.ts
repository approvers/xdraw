/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Mesh from "./Mesh";

export default class PlaneMesh extends Mesh {
  constructor(width = 1, height = 1) {
    super({ Width: { initValue: width },
Height: { initValue: height } });
  }

  /*
   * Faces
   * 3_____0
   * |     |
   * |     |
   * 2_____1
   */
  run() {
    const width = this.store.addProp("Width", 1);
    const height = this.store.addProp("Height", 1);
    const index: number[] = [3, 2, 0, 0, 2, 1];
    const vertex: number[] = [
      width,
      height,
      0,
      width,
      -height,
      0,
      -width,
      -height,
      0,
      -width,
      height,
      0,
    ].map((e) => e / 2);
    const normal: number[] = [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1];
    const uv: number[] = [1, 0, 1, 1, 0, 0, 0, 1];

    this.packMesh({
      indices: index,
      vertices: vertex,
      normals: normal,
      uvs: uv,
    });
  }
}
