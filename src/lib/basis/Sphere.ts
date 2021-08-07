/**
 * @author MikuroXina / https://MikuroXina
 */

import Box3 from "./Box3";
import Matrix4 from "./Matrix4";
import Vector3 from "./Vector3";

export default class Sphere {
  constructor(private center = new Vector3(), public radius = 0) {}

  static fromPoints(points: Vector3[], center?: Vector3): Sphere {
    const box = Box3.fromPoints(points);
    let centerP = center;
    if (!centerP) {
      centerP = box.getCenter();
    }
    const radius = points.reduce(
      (acc, cur) => Math.max(acc, (center as Vector3).distanceToSquared(cur)),
      0,
    );
    return new Sphere(center, radius);
  }

  setCenter(v: Vector3): void {
    this.center = v.clone();
  }

  getCenter(): Vector3 {
    return this.center;
  }

  clone(): Sphere {
    return new Sphere(this.center.clone(), this.radius);
  }

  applyMatrix4(m: Matrix4): Sphere {
    this.center.applyMatrix4(m);
    this.radius *= m.maxScaleOnAxis();
    return this;
  }
}
