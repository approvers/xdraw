/**
 * @author MikuroXina / https://MikuroXina
 */

import { Vector3 } from "./Vector3";

export class Plane {
  constructor(private normal = new Vector3(1, 0, 0), public constant = 0) {}

  setNormal(v: Vector3): void {
    this.normal = v.clone();
  }

  getNormal(): Vector3 {
    return this.normal;
  }

  setComponents({
    x,
    y,
    z,
    w,
  }: {
    x: number;
    y: number;
    z: number;
    w: number;
  }): Plane {
    this.normal = new Vector3(x, y, z);
    this.constant = w;
    return this;
  }

  clone(): Plane {
    return new Plane(this.normal.clone(), this.constant);
  }

  normalize(): Plane {
    const len = this.normal.length();
    if (len === 0) {
      return this;
    }
    const inverseNormalLength = 1.0 / len;
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;
    return this;
  }

  distanceToPoint(p: Vector3): number {
    return this.normal.dot(p) + this.constant;
  }
}
