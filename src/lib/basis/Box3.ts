/**
 * @author RkEclait / https://MikuroXina
 */

import Vector3 from './Vector3';

export default class Box3 {
  constructor(
      public min = new Vector3(+Infinity, +Infinity, +Infinity),
      public max = new Vector3(-Infinity, -Infinity, -Infinity)) {}

  static fromPoints(points: Vector3[]) {
    const box = new Box3();
    box.min = points.reduce((acc, cur) => acc.min(cur), box.min);
    box.max = points.reduce((acc, cur) => acc.max(cur), box.max);
    return box;
  }


  clone(): Box3 {
    throw new Error('Method not implemented.');
  }

  empty() {
    return (
        this.max.x < this.min.x || this.max.y < this.min.y ||
        this.max.z < this.min.z);
  }

  getCenter() {
    if (this.empty()) return new Vector3();
    return this.min.lerp(this.max, 0.5);
  }
}
