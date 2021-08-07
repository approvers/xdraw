/**
 * @author RkEclait / https://MikuroXina
 */

import Vector3 from "./Vector3";

export default class Box3 {
  constructor(
    public min = new Vector3(
      Number(Infinity),
      Number(Infinity),
      Number(Infinity),
    ),
    public max = new Vector3(-Infinity, -Infinity, -Infinity),
  ) {}

  static fromPoints(points: Vector3[]): Box3 {
    const box = new Box3();
    box.min = points.reduce((acc, cur) => acc.min(cur), box.min);
    box.max = points.reduce((acc, cur) => acc.max(cur), box.max);
    return box;
  }

  clone(): Box3 {
    throw new Error("Method not implemented.");
  }

  empty(): boolean {
    return (
      this.max.x < this.min.x ||
      this.max.y < this.min.y ||
      this.max.z < this.min.z
    );
  }

  getCenter(): Vector3 {
    if (this.empty()) {
      return new Vector3();
    }
    return this.min.lerp(this.max, 0.5);
  }
}
