/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author bhouston / http://clara.io
 * @author RkEclair / https://github.com/RkEclair
 */

import Euler from "./Euler";
import Vector3 from "./Vector3";

export default class Quaternion {
  private onChange: Function = () => {};

  constructor(
    private _x: number = 0,
    private _y: number = 0,
    private _z: number = 0,
    private _w: number = 1
  ) {}

  get x() {
    return this._x;
  }
  set x(v) {
    this._x = v;
    this.onChange();
  }

  get y() {
    return this._y;
  }
  set y(v) {
    this._y = v;
    this.onChange();
  }

  get z() {
    return this._z;
  }
  set z(v) {
    this._z = v;
    this.onChange();
  }

  get w() {
    return this._w;
  }
  set w(v) {
    this._w = v;
    this.onChange();
  }

  static fromEuler(euler: Euler, update = false) {
    if (!(euler instanceof Euler)) {
      throw new Error("ArgumentError: Expected the instance of Euler.");
    }

    const {x, y, z, order} = euler,
      newQ = new Quaternion();
    var c1 = Math.cos(x / 2);
    var c2 = Math.cos(y / 2);
    var c3 = Math.cos(z / 2);

    var s1 = Math.sin(x / 2);
    var s2 = Math.sin(y / 2);
    var s3 = Math.sin(z / 2);

    switch (order) {
      case "XYZ":
        newQ._x = s1 * c2 * c3 + c1 * s2 * s3;
        newQ._y = c1 * s2 * c3 - s1 * c2 * s3;
        newQ._z = c1 * c2 * s3 + s1 * s2 * c3;
        newQ._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "YXZ":
        newQ._x = s1 * c2 * c3 + c1 * s2 * s3;
        newQ._y = c1 * s2 * c3 - s1 * c2 * s3;
        newQ._z = c1 * c2 * s3 - s1 * s2 * c3;
        newQ._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case "ZXY":
        newQ._x = s1 * c2 * c3 - c1 * s2 * s3;
        newQ._y = c1 * s2 * c3 + s1 * c2 * s3;
        newQ._z = c1 * c2 * s3 + s1 * s2 * c3;
        newQ._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "ZYX":
        newQ._x = s1 * c2 * c3 - c1 * s2 * s3;
        newQ._y = c1 * s2 * c3 + s1 * c2 * s3;
        newQ._z = c1 * c2 * s3 - s1 * s2 * c3;
        newQ._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      case "YZX":
        newQ._x = s1 * c2 * c3 + c1 * s2 * s3;
        newQ._y = c1 * s2 * c3 + s1 * c2 * s3;
        newQ._z = c1 * c2 * s3 - s1 * s2 * c3;
        newQ._w = c1 * c2 * c3 - s1 * s2 * s3;
        break;
      case "XZY":
        newQ._x = s1 * c2 * c3 - c1 * s2 * s3;
        newQ._y = c1 * s2 * c3 - s1 * c2 * s3;
        newQ._z = c1 * c2 * s3 + s1 * s2 * c3;
        newQ._w = c1 * c2 * c3 + s1 * s2 * s3;
        break;
      default:
        throw new Error("ArgumentError: Illegal rotation order on Euler.");
    }

    if (update) newQ.onChange();

    return newQ;
  }

  static fromAxisAngle(axis: Vector3, angle: number) {
    const halfAngle = angle / 2,
      s = Math.sin(halfAngle),
      newQ = new Quaternion();

    newQ._x = axis.x * s;
    newQ._y = axis.y * s;
    newQ._z = axis.z * s;
    newQ._w = Math.cos(halfAngle);

    newQ.onChange();

    return newQ;
  }

  static fromRotationMatrix(m) {
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

      newQ._w = 0.25 / s;
      newQ._x = (m32 - m23) * s;
      newQ._y = (m13 - m31) * s;
      newQ._z = (m21 - m12) * s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      newQ._w = (m32 - m23) / s;
      newQ._x = 0.25 * s;
      newQ._y = (m12 + m21) / s;
      newQ._z = (m13 + m31) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      newQ._w = (m13 - m31) / s;
      newQ._x = (m12 + m21) / s;
      newQ._y = 0.25 * s;
      newQ._z = (m23 + m32) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      newQ._w = (m21 - m12) / s;
      newQ._x = (m13 + m31) / s;
      newQ._y = (m23 + m32) / s;
      newQ._z = 0.25 * s;
    }

    newQ.onChange();

    return newQ;
  }

  static fromUnitVectors(from: Vector3, to: Vector3) {
    let v = new Vector3(),
      r = from.dot(to) + 1;
    if (r < 0.000001) {
      r = 0;
      if (Math.abs(from.x) > Math.abs(from.z)) {
        v.set(-from.y, from.x, 0);
      } else {
        v.set(0, -from.z, from.y);
      }
    } else {
      v = from.cross(to);
    }
    return new Quaternion(v.x, v.y, v.z, r);
  }

  static slerp(qa: Quaternion, qb: Quaternion, t: number) {
    return qa.clone().slerp(qb, t);
  }

  static slerpFlat(
    dst: number[],
    dstOffset: number,
    src0: number[],
    srcOffset0: number,
    src1: number[],
    srcOffset1: number,
    t: number
  ) {
    // fuzz-free and array-based Quaternion SLERP operation
    let x0 = src0[srcOffset0 + 0],
      y0 = src0[srcOffset0 + 1],
      z0 = src0[srcOffset0 + 2],
      w0 = src0[srcOffset0 + 3];
    const x1 = src1[srcOffset1 + 0],
      y1 = src1[srcOffset1 + 1],
      z1 = src1[srcOffset1 + 2],
      w1 = src1[srcOffset1 + 3];

    if (w0 !== w1 || x0 !== x1 || y0 !== y1 || z0 !== z1) {
      var s = 1 - t,
        cos = x0 * x1 + y0 * y1 + z0 * z1 + w0 * w1,
        dir = cos >= 0 ? 1 : -1,
        sqrSin = 1 - cos * cos;

      // Skip the Slerp for tiny steps to avoid numeric problems:
      if (sqrSin > 0.000001) {
        var sin = Math.sqrt(sqrSin),
          len = Math.atan2(sin, cos * dir);

        s = Math.sin(s * len) / sin;
        t = Math.sin(t * len) / sin;
      }

      var tDir = t * dir;

      x0 = x0 * s + x1 * tDir;
      y0 = y0 * s + y1 * tDir;
      z0 = z0 * s + z1 * tDir;
      w0 = w0 * s + w1 * tDir;

      // Normalize in case we just did a lerp:
      if (s === 1 - t) {
        var f = 1 / Math.sqrt(x0 * x0 + y0 * y0 + z0 * z0 + w0 * w0);

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

  static fromArray(array: number[], offset: number = 0) {
    const x = array[offset];
    const y = array[offset + 1];
    const z = array[offset + 2];
    const w = array[offset + 3];
    return new Quaternion(x, y, z, w);
  }

  set(x: number, y: number, z: number, w: number) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
    this.onChange();
    return this;
  }

  clone() {
    return new Quaternion(this._x, this._y, this._z, this._w);
  }

  copy(q: Quaternion) {
    this._x = q.x;
    this._y = q.y;
    this._z = q.z;
    this._w = q.w;
    this.onChange();
    return this;
  }

  angleTo(q: Quaternion) {
    return 2 * Math.acos(Math.abs(Math.min(Math.max(this.dot(q), -1), 1)));
  }

  rotateTowards(q: Quaternion, step: number) {
    const oneAngle = step / this.angleTo(q),
      works = [];
    if (oneAngle === 0 || Number.isFinite(oneAngle))
      return [new Promise((resolve) => resolve(this))];
    for (let i = 0; i < step; ++i) {
      works.push(
        new Promise((resolve) => {
          resolve(Quaternion.slerp(this, q, Math.min(1, i * oneAngle)));
        })
      );
    }
    return works;
  }

  inverse() {
    return this.conjugate();
  }

  conjugate() {
    this._x *= -1;
    this._y *= -1;
    this._z *= -1;
    this.onChange();
    return this;
  }

  dot(v: Quaternion) {
    return this._x * v.x + this._y * v.y + this._z * v.z + this._w * v.w;
  }

  lengthSq() {
    return (
      this._x * this._x +
      this._y * this._y +
      this._z * this._z +
      this._w * this._w
    );
  }
  length() {
    return Math.sqrt(this.lengthSq());
  }

  normalize() {
    let l = this.length();

    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;
      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }
    this.onChange();
    return this;
  }

  multiply(q: Quaternion) {
    const {_x: qax, _y: qay, _z: qaz, _w: qaw} = this;
    const {_x: qbx, _y: qby, _z: qbz, _w: qbw} = q;

    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    this.onChange();
    return this;
  }

  premultiply(q: Quaternion) {
    return q.multiply(this);
  }

  slerp(q: Quaternion, t: number) {
    if (t === 0) return this;
    if (t === 1) return q.clone();
    const {_x: x, _y: y, _z: z, _w: w} = this;
    let cosHalfTheta = this.dot(q);

    if (cosHalfTheta < 0) {
      this._w = -q._w;
      this._x = -q._x;
      this._y = -q._y;
      this._z = -q._z;

      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(q);
    }

    if (cosHalfTheta >= 1.0) {
      this._w = w;
      this._x = x;
      this._y = y;
      this._z = z;

      return this;
    }

    const sqrSinHalfTheta = 1.0 - cosHalfTheta * cosHalfTheta;

    if (sqrSinHalfTheta <= 0.000001) {
      const s = 1 - t;
      this._w = s * w + t * this._w;
      this._x = s * x + t * this._x;
      this._y = s * y + t * this._y;
      this._z = s * z + t * this._z;

      return this.normalize();
    }

    const sinHalfTheta = Math.sqrt(sqrSinHalfTheta);
    const halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    const ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta,
      ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this._w = w * ratioA + this._w * ratioB;
    this._x = x * ratioA + this._x * ratioB;
    this._y = y * ratioA + this._y * ratioB;
    this._z = z * ratioA + this._z * ratioB;

    this.onChange();

    return this;
  }

  equals(q: Quaternion) {
    return (
      this._x === q.x && this._y === q.y && this._z === q.z && this._w === q.w
    );
  }

  toArray(array: number[] = [], offset: number = 0) {
    array[offset] = this._x;
    array[offset + 1] = this._y;
    array[offset + 2] = this._z;
    array[offset + 3] = this._w;
    return array;
  }

  setOnChange(callback: Function) {
    this.onChange = callback;
    return this;
  }
}
