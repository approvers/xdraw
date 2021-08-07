/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Ref: https://en.wikipedia.org/wiki/Cylindrical_coordinate_system
 *
 */

import Vector3 from "./Vector3";

export default class Cylindrical {
  constructor(public radius = 1.0, public theta = 0, public y = 0) {}

  clone(): Cylindrical {
    return new Cylindrical(this.radius, this.theta, this.y);
  }

  static fromVector3(v: Vector3): Cylindrical {
    return Cylindrical.fromCartesianCoords(v.x, v.y, v.z);
  }

  static fromCartesianCoords(x: number, y: number, z: number): Cylindrical {
    return new Cylindrical(Math.sqrt(x * x + z * z), Math.atan2(x, z), y);
  }
}
