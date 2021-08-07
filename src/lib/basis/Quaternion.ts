/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://clara.io
 * @author MikuroXina / https://github.com/MikuroXina
 */

import { Euler } from "./Euler";
import { Matrix4 } from "./Matrix4";
import { Vector3 } from "./Vector3";

export interface NumBuffer {
  data: number[];
  offset: number;
}

export class Quaternion {
  public x = 0;

  public y = 0;

  public z = 0;

  public w = 1;

  static fromEuler(euler: Euler): Quaternion {
    const {
        rotations: { x, y, z },
        order,
      } = euler,
      newQ = new Quaternion();
    const c1 = Math.cos(x / 2);
    const c2 = Math.cos(y / 2);
    const c3 = Math.cos(z / 2);

    const s1 = Math.sin(x / 2);
    const s2 = Math.sin(y / 2);
    const s3 = Math.sin(z / 2);

    switch (order) {
      case "XYZ":
        newQ.x = s1 * c2 * c3 + c1 * s2 * s3;
        newQ.y = c1 * s2 * c3 - s1 * c2 * s3;
        newQ.z = c1 * c2 * s3 + s1 * s2 * c3;
        newQ.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "YXZ":
        newQ.x = s1 * c2 * c3 + c1 * s2 * s3;
        newQ.y = c1 * s2 * c3 - s1 * c2 * s3;
        newQ.z = c1 * c2 * s3 - s1 * s2 * c3;
        newQ.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case "ZXY":
        newQ.x = s1 * c2 * c3 - c1 * s2 * s3;
        newQ.y = c1 * s2 * c3 + s1 * c2 * s3;
        newQ.z = c1 * c2 * s3 + s1 * s2 * c3;
        newQ.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "ZYX":
        newQ.x = s1 * c2 * c3 - c1 * s2 * s3;
        newQ.y = c1 * s2 * c3 + s1 * c2 * s3;
        newQ.z = c1 * c2 * s3 - s1 * s2 * c3;
        newQ.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case "YZX":
        newQ.x = s1 * c2 * c3 + c1 * s2 * s3;
        newQ.y = c1 * s2 * c3 + s1 * c2 * s3;
        newQ.z = c1 * c2 * s3 - s1 * s2 * c3;
        newQ.w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "XZY":
        newQ.x = s1 * c2 * c3 - c1 * s2 * s3;
        newQ.y = c1 * s2 * c3 - s1 * c2 * s3;
        newQ.z = c1 * c2 * s3 + s1 * s2 * c3;
        newQ.w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      default:
        throw new Error("ArgumentError: Illegal rotation order on Euler.");
    }

    return newQ;
  }

  static fromAxisAngle(axis: Vector3, angle: number): Quaternion {
    const halfAngle = angle / 2,
      s = Math.sin(halfAngle),
      newQ = new Quaternion();

    newQ.x = axis.x * s;
    newQ.y = axis.y * s;
    newQ.z = axis.z * s;
    newQ.w = Math.cos(halfAngle);

    return newQ;
  }

  static fromRotationMatrix(m: Matrix4): Quaternion {
    const te = m.elements,
      m11 = te[0],
      m12 = te[4],
      m13 = te[8],
      m21 = te[1],
      m22 = te[5],
      m23 = te[9],
      m31 = te[2],
      m32 = te[6],
      m33 = te[10],
      trace = m11 + m22 + m33,
      newQ = new Quaternion();
    let s: number;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);

      newQ.w = 0.25 / s;
      newQ.x = (m32 - m23) * s;
      newQ.y = (m13 - m31) * s;
      newQ.z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      newQ.w = (m32 - m23) / s;
      newQ.x = 0.25 * s;
      newQ.y = (m12 + m21) / s;
      newQ.z = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      newQ.w = (m13 - m31) / s;
      newQ.x = (m12 + m21) / s;
      newQ.y = 0.25 * s;
      newQ.z = (m23 + m32) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      newQ.w = (m21 - m12) / s;
      newQ.x = (m13 + m31) / s;
      newQ.y = (m23 + m32) / s;
      newQ.z = 0.25 * s;
    }

    return newQ;
  }

  static fromUnitVectors(from: Vector3, to: Vector3): Quaternion {
    let v = new Vector3(),
      r = from.dot(to) + 1;
    if (r < 0.000001) {
      r = 0;
      if (Math.abs(from.x) > Math.abs(from.z)) {
        v = new Vector3(-from.y, from.x, 0);
      } else {
        v = new Vector3(0, -from.z, from.y);
      }
    } else {
      v = from.cross(to);
    }
    const q = new Quaternion();
    q.x = v.x;
    q.y = v.y;
    q.z = v.z;
    q.w = r;
    return q;
  }

  static slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    if (t <= 0) {
      return a.clone();
    }
    if (t >= 1) {
      return b.clone();
    }
    let qa = a;
    const qb = b;
    const { x, y, z, w } = qa;
    let cosHalfTheta = qa.dot(qb);

    if (cosHalfTheta < 0) {
      qa = qb.multiplyScalar(-1);
      cosHalfTheta *= -1;
    } else {
      qa = qb.clone();
    }

    if (cosHalfTheta >= 1.0) {
      return qa.clone();
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= Number.EPSILON) {
      const newQ = new Quaternion();
      const s = 1 - t;
      newQ.w = s * w + t * qa.w;
      newQ.x = s * x + t * qa.x;
      newQ.y = s * y + t * qa.y;
      newQ.z = s * z + t * qa.z;

      return newQ.normalize();
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta;
    const newQ = new Quaternion();

    newQ.w = w * ratioA + qa.w * ratioB;
    newQ.x = x * ratioA + qa.x * ratioB;
    newQ.y = y * ratioA + qa.y * ratioB;
    newQ.z = z * ratioA + qa.z * ratioB;

    return newQ;
  }

  static slerpFlat(
    { data: dst, offset: dstOffset }: NumBuffer,
    [{ data: src0, offset: srcOffset0 }, { data: src1, offset: srcOffset1 }]: [
      NumBuffer,
      NumBuffer,
    ],
    time: number,
  ): void {
    // Fuzz-free and array-based Quaternion SLERP operation
    let x0 = src0[srcOffset0 + 0],
      y0 = src0[srcOffset0 + 1],
      z0 = src0[srcOffset0 + 2],
      w0 = src0[srcOffset0 + 3];
    const x1 = src1[srcOffset1 + 0],
      y1 = src1[srcOffset1 + 1],
      z1 = src1[srcOffset1 + 2],
      w1 = src1[srcOffset1 + 3];
    let t = time;

    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      let s = 1 - t;
      const cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
        dir = cos >= 0 ? 1 : -1,
        sqrSin = 1 - cos * cos;

      // Skip the Slerp for tiny steps to avoid numeric problems:
      if (sqrSin > 0.000001) {
        const sin = Math.sqrt(sqrSin),
          len = Math.atan2(sin, cos * dir);

        s = Math.sin(s * len) / sin;
        t = Math.sin(t * len) / sin;
      }

      const tDir = t * dir;

      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;

      // Normalize in case we just did a lerp:
      if (s === 1 - t) {
        const f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

        x0 *= f;
        y0 *= f;
        z0 *= f;
        w0 *= f;
      }
    }

    dst[dstOffset] = x0;
    dst[dstOffset + 1] = y0;
    dst[dstOffset + 2] = z0;
    dst[dstOffset + 3] = w0;
  }

  static fromArray(array: number[], offset = 0): Quaternion {
    const q = new Quaternion();
    q.x = array[offset];
    q.y = array[offset + 1];
    q.z = array[offset + 2];
    q.w = array[offset + 3];
    return q;
  }

  clone(): Quaternion {
    const q = new Quaternion();
    q.x = this.x;
    q.y = this.y;
    q.z = this.z;
    q.w = this.w;
    return q;
  }

  angleTo(q: Quaternion): number {
    return 2 * Math.acos(Math.abs(Math.min(Math.max(this.dot(q), -1), 1)));
  }

  rotateTowards(q: Quaternion, step: number): Promise<Quaternion>[] {
    const oneAngle = step / this.angleTo(q);
    if (oneAngle === 0 || Number.isFinite(oneAngle)) {
      return [
        new Promise((resolve) => {
          resolve(this);
        }),
      ];
    }
    const works: Promise<Quaternion>[] = [];
    for (let i = 0; i < step; i += 1) {
      works.push(
        new Promise((resolve) => {
          resolve(Quaternion.slerp(this, q, Math.min(1, i * oneAngle)));
        }),
      );
    }
    return works;
  }

  inverse(): Quaternion {
    return this.conjugate();
  }

  conjugate(): Quaternion {
    const newQ = this.clone();
    newQ.x *= -1;
    newQ.y *= -1;
    newQ.z *= -1;
    return newQ;
  }

  dot(v: Quaternion): number {
    const newQ = this.clone();
    return newQ.x * v.x + newQ.y * v.y + newQ.z * v.z + newQ.w * v.w;
  }

  lengthSq(): number {
    return (
      this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w
    );
  }

  length(): number {
    return Math.sqrt(this.lengthSq());
  }

  normalize(): Quaternion {
    let l = this.length();
    const newQ = this.clone();

    if (l === 0) {
      newQ.x = 0;
      newQ.y = 0;
      newQ.z = 0;
      newQ.w = 1;
    } else {
      l = 1 / l;
      newQ.x = this.x * l;
      newQ.y = this.y * l;
      newQ.z = this.z * l;
      newQ.w = this.w * l;
    }
    return newQ;
  }

  multiplyScalar(a: number): Quaternion {
    const newQ = this.clone();
    newQ.x *= a;
    newQ.y *= a;
    newQ.z *= a;
    newQ.w *= a;
    return newQ;
  }

  multiply(q: Quaternion): Quaternion {
    const newQ = this.clone();
    const { x: qax, y: qay, z: qaz, w: qaw } = newQ;
    const { x: qbx, y: qby, z: qbz, w: qbw } = q;

    newQ.x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    newQ.y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    newQ.z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    newQ.w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return newQ;
  }

  premultiply(q: Quaternion): Quaternion {
    return q.multiply(this);
  }

  equals(q: Quaternion): boolean {
    return this.x === q.x && this.y === q.y && this.z === q.z && this.w === q.w;
  }

  toArray(array: number[] = [], offset = 0): number[] {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    return array;
  }
}
