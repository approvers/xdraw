/**
 * @author RkEclait / https:  // RkEclair
 */

import Vector3 from './Vector3';

export default class Plane {
  constructor(private _normal = new Vector3(1, 0, 0), public constant = 0) {}

  set normal(v: Vector3) {
    this._normal = v.clone();
  }
  get normal() {
    return this._normal;
  }

  setComponents(x, y, z, w) {
    this._normal = new Vector3(x, y, z);
    this.constant = w;
    return this;
  }

  clone() {
    return new Plane(this._normal.clone(), this.constant);
  }

  normalize() {
    const len = this.normal.length();
    if (len === 0) return;
    var inverseNormalLength = 1.0 / len;
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;
    return this;
  }

  distanceToPoint(p: Vector3) {
    return this.normal.dot(p) + this.constant;
  }
}
