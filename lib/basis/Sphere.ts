/**
 * @author MikuroXina / https://MikuroXina
 */

import Box3 from './Box3';
import Matrix4 from './Matrix4';
import Vector3 from './Vector3';

export default class Sphere {
  constructor(private _center = new Vector3(), public radius = 0) {}

  static fromPoints(points: Vector3[], center?: Vector3) {
    const box = Box3.fromPoints(points);
    if (center === undefined) {
      center = box.getCenter();
    }
    const radius = points.reduce(
        (acc, cur) => Math.max(acc, (center as Vector3).distanceToSquared(cur)),
        0);
    return new Sphere(center, radius);
  }

  set center(v: Vector3) {
    this._center = v.clone();
  }
  get center() {
    return this._center;
  }

  clone() {
    return new Sphere(this._center.clone(), this.radius);
  }

  applyMatrix4(m: Matrix4) {
    this.center.applyMatrix4(m);
    this.radius = this.radius * m.maxScaleOnAxis();
    return this;
  }
}
