/**
 * @author mrdoob / http://mrdoob.com/
 * @author Mugen87 / https://github.com/Mugen87
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Mesh from "./Mesh";

export default class BoxMesh extends Mesh {
  constructor(width = 1, height = 1, depth = 1) {
    super({
      Width: { initValue: width },
      Height: { initValue: height },
      Depth: { initValue: depth },
    });
  }

  /*
   * Face
   *          1_____0_____3_____2
   *          |     |     |     |
   *          |     |     |     |
   * 0_____1_____5_____4_____7_____6
   * x |     |     |     |
   * | |     |     |     |
   * v 3_____2_____6_____7
   * <-y
   *  +z<- | ->-z
   */

  run() {
    const width = this.store.addProp("Width", 1);
    const height = this.store.addProp("Height", 1);
    const depth = this.store.addProp("Depth", 1);

    const indices: number[] = [
      0, 3, 1, 1, 3, 2, 1, 2, 5, 5, 2, 6, 5, 6, 4, 4, 6, 7, 1, 5, 0, 0, 5, 4, 0,
      4, 3, 3, 4, 7, 3, 7, 2, 2, 7, 6,
    ];
    const sqrt3 = 0.5773502691896258;
    const vertices: number[] = [
        width,
        height,
        depth,
        width,
        -height,
        depth,
        -width,
        -height,
        depth,
        -width,
        height,
        depth,
        width,
        height,
        -depth,
        width,
        -height,
        -depth,
        -width,
        -height,
        -depth,
        -width,
        height,
        -depth,
      ].map((e) => e / 2),
      normals: number[] = [
        1, 1, 1, 1, -1, 1, -1, -1, 1, -1, 1, 1, 1, 1, -1, 1, -1, -1, -1, -1, -1,
        -1, 1, -1,
      ].map((e) => e * -sqrt3),
      uvs: number[] = [];

    this.packMesh({ indices,
vertices,
normals,
uvs });
  }
}
