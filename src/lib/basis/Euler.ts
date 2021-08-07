import { Matrix4 } from "./Matrix4";
import { Quaternion } from "./Quaternion";
import { Vector3 } from "./Vector3";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

type RotationOrder = "XYZ" | "YZX" | "ZXY" | "XZY" | "YXZ" | "ZYX";

export class Euler {
  constructor(
    public readonly rotations: Vector3 = new Vector3(),
    public readonly order: RotationOrder = "XYZ",
  ) {}

  static fromRotationMatrix(m: Matrix4, order: RotationOrder): Euler {
    const clamp = (src: number, min: number, max: number) =>
      Math.max(Math.min(src, max), min);

    const te = m.elements;
    const [m11, m21, m31, m12, m22, m32, m13, m23, m33] = te;

    let x: number, y: number, z: number;

    if (order === "XYZ") {
      y = Math.asin(clamp(m13, -1, 1));

      if (Math.abs(m13) < 0.99999) {
        x = Math.atan2(-m23, m33);
        z = Math.atan2(-m12, m11);
      } else {
        x = Math.atan2(m32, m22);
        z = 0;
      }
    } else if (order === "YXZ") {
      x = Math.asin(-clamp(m23, -1, 1));

      if (Math.abs(m23) < 0.99999) {
        y = Math.atan2(m13, m33);
        z = Math.atan2(m21, m22);
      } else {
        y = Math.atan2(-m31, m11);
        z = 0;
      }
    } else if (order === "ZXY") {
      x = Math.asin(clamp(m32, -1, 1));

      if (Math.abs(m32) < 0.99999) {
        y = Math.atan2(-m31, m33);
        z = Math.atan2(-m12, m22);
      } else {
        y = 0;
        z = Math.atan2(m21, m11);
      }
    } else if (order === "ZYX") {
      y = Math.asin(-clamp(m31, -1, 1));

      if (Math.abs(m31) < 0.99999) {
        x = Math.atan2(m32, m33);
        z = Math.atan2(m21, m11);
      } else {
        x = 0;
        z = Math.atan2(-m12, m22);
      }
    } else if (order === "YZX") {
      z = Math.asin(clamp(m21, -1, 1));

      if (Math.abs(m21) < 0.99999) {
        x = Math.atan2(-m23, m22);
        y = Math.atan2(-m31, m11);
      } else {
        x = 0;
        y = Math.atan2(m13, m33);
      }
    } else if (order === "XZY") {
      z = Math.asin(-clamp(m12, -1, 1));

      if (Math.abs(m12) < 0.99999) {
        x = Math.atan2(m32, m22);
        y = Math.atan2(m13, m11);
      } else {
        x = Math.atan2(-m23, m33);
        y = 0;
      }
    } else {
      throw new Error("ArgumentError: Illegal rotation order on Euler");
    }

    return new Euler(new Vector3(x, y, z), order);
  }

  static fromQuaternion(q: Quaternion, order: RotationOrder): Euler {
    const m = Matrix4.makeRotationFromQuaternion(q);
    return Euler.fromRotationMatrix(m, order);
  }

  static fromDegreesRotations(x: number, y: number, z: number): Euler {
    const DEG2RAD = Math.PI / 180;
    return new Euler(new Vector3(x * DEG2RAD, y * DEG2RAD, z * DEG2RAD));
  }

  clone(): Euler {
    return new Euler(this.rotations.clone(), this.order);
  }

  add(v: Euler): Euler {
    if (this.order !== v.order) {
      throw new Error("Cannot add with ones having different rotation orders.");
    }
    return new Euler(this.rotations.add(v.rotations), this.order);
  }
}
