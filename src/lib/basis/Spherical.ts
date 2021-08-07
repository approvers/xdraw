/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 * @author MikuroXina / https://github.com/MikuroXina
 *
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive
 * y-axis is up. The azimuthal angle (theta) is measured from the positive
 * z-axis.
 */

import Vector3 from "./Vector3";

export default class Spherical {
  static fromVector3(v: Vector3): Spherical {
    return Spherical.fromCartesianCoords(v.x, v.y, v.z);
  }

  static fromCartesianCoords(x: number, y: number, z: number): Spherical {
    const radius = Math.sqrt(x * x + y * y + z * z);
    if (radius === 0) {
      return new Spherical(0, 0, 0);
    }
    return new Spherical(
      radius,
      Math.acos(Math.min(Math.max(y / radius, -1), 1)),
      Math.atan2(x, z),
    );
  }

  constructor(public radius = 1.0, public phi = 0, public theta = 0) {}

  clone(): Spherical {
    return new Spherical(this.radius, this.phi, this.theta);
  }

  // Restrict phi to be between EPS and PI-EPS
  makeSafe(): Spherical {
    const EPS = 0.000001;
    this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
    return this;
  }
}
