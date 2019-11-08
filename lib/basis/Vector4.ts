/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import BufferAttribute from './BufferAttribute';
import Matrix4 from './Matrix4';
import Quaternion from './Quaternion';

export default class Vector4 {
  constructor(
      public x: number = 0, public y: number = 0, public z: number = 0,
      public w: number = 1) {}

  /**
   * @static
   * @param {Quaternion} q assumed to be normalized
   * @returns {Vector4} - Axis and Angle
   * @memberof Vector4
   */
  static fromQuaternionToAxisAngle(q: Quaternion): Vector4 {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm

    let x: number, y: number, z: number, w: number;

    w = 2 * Math.acos(q.w);

    const s = Math.sqrt(1 - q.w * q.w);

    if (s < 0.0001) {
      x = 1;
      y = 0;
      z = 0;
    } else {
      x = q.x / s;
      y = q.y / s;
      z = q.z / s;
    }

    return new Vector4(x, y, z, w);
  }

  static fromRotationMatrixToAxisAngle(m: Matrix4) {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/matrixToAngle/index.htm

    // assumes the upper 3x3 of m is a pure rotation matrix (i.e,
    // unscaled)

    let angle: number, x: number, y: number, z: number;
    const epsilon = 0.01,  // margin to allow for rounding errors
        epsilon2 = 0.1,    // margin to distinguish between 0 and 180 degrees
        te = m.elements, m11 = te[0], m12 = te[4], m13 = te[8], m21 = te[1],
          m22 = te[5], m23 = te[9], m31 = te[2], m32 = te[6], m33 = te[10];

    if (Math.abs(m12 - m21) < epsilon && Math.abs(m13 - m31) < epsilon &&
        Math.abs(m23 - m32) < epsilon) {
      // singularity found
      // first check for identity matrix which must have +1 for all
      // terms in leading diagonal and zero in other terms

      if (Math.abs(m12 + m21) < epsilon2 && Math.abs(m13 + m31) < epsilon2 &&
          Math.abs(m23 + m32) < epsilon2 &&
          Math.abs(m11 + m22 + m33 - 3) < epsilon2) {
        // this singularity is identity matrix so angle = 0

        return new Vector4(1, 0, 0, 0);  // zero angle, arbitrary axis
      }

      // otherwise this singularity is angle = 180

      angle = Math.PI;

      const xx = (m11 + 1) / 2;
      const yy = (m22 + 1) / 2;
      const zz = (m33 + 1) / 2;
      const xy = (m12 + m21) / 4;
      const xz = (m13 + m31) / 4;
      const yz = (m23 + m32) / 4;

      if (xx > yy && xx > zz) {
        // m11 is the largest diagonal term

        if (xx < epsilon) {
          x = 0;
          y = 0.707106781;
          z = 0.707106781;
        } else {
          x = Math.sqrt(xx);
          y = xy / x;
          z = xz / x;
        }
      } else if (yy > zz) {
        // m22 is the largest diagonal term

        if (yy < epsilon) {
          x = 0.707106781;
          y = 0;
          z = 0.707106781;
        } else {
          y = Math.sqrt(yy);
          x = xy / y;
          z = yz / y;
        }
      } else {
        // m33 is the largest diagonal term so base result on this

        if (zz < epsilon) {
          x = 0.707106781;
          y = 0.707106781;
          z = 0;
        } else {
          z = Math.sqrt(zz);
          x = xz / z;
          y = yz / z;
        }
      }
      return new Vector4(x, y, z, angle);  // return 180 deg rotation
    }

    // as we have reached here there are no singularities so we can
    // handle normally

    let s = Math.sqrt(
        (m32 - m23) * (m32 - m23) + (m13 - m31) * (m13 - m31) +
        (m21 - m12) * (m21 - m12));  // used to normalize

    if (Math.abs(s) < 0.001) s = 1;

    // prevent divide by zero, should not happen if matrix is orthogonal
    // and should be caught by singularity test above, but I've left it
    // in just in case

    x = (m32 - m23) / s;
    y = (m13 - m31) / s;
    z = (m21 - m12) / s;
    angle = Math.acos((m11 + m22 + m33 - 1) / 2);

    return new Vector4(x, y, z, angle);
  }

  setScalar(s: number) {
    this.x = s;
    this.y = s;
    this.z = s;
    this.w = s;
    return this;
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  setY(y: number) {
    this.y = y;
    return this;
  }

  setZ(z: number) {
    this.z = z;
    return this;
  }

  setW(w: number) {
    this.w = w;
    return this;
  }

  setComponent(index: number, value: number) {
    switch (index) {
      case 0:
        this.x = value;
        break;
      case 1:
        this.y = value;
        break;
      case 2:
        this.z = value;
        break;
      case 3:
        this.w = value;
        break;
      default:
        throw new Error(`OutOfRange:${index}`);
    }

    return this;
  }

  getComponent(index: number) {
    switch (index) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error(`OutOfRange:${index}`);
    }
  }

  clone() {
    return new Vector4(this.x, this.y, this.z, this.w);
  }

  add(v: Vector4) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;
    return this;
  }

  addScalar(s: number) {
    this.x += s;
    this.y += s;
    this.z += s;
    this.w += s;
    return this;
  }

  sub(v: Vector4) {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;
    return this;
  }

  subScalar(s: number) {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    this.w -= s;
    return this;
  }

  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    this.z *= s;
    this.w *= s;
    return this;
  }

  applyMatrix4(m: Matrix4) {
    const {x, y, z, w} = this;
    const e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
    this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;
    return this;
  }

  divideScalar(s: number) {
    return this.multiplyScalar(1 / s);
  }

  min(v: Vector4) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    this.w = Math.min(this.w, v.w);
    return this;
  }

  max(v: Vector4) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    this.w = Math.max(this.w, v.w);
    return this;
  }

  clamp(min: Vector4, max: Vector4) {
    // assumes min < max, componentwise

    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    this.w = Math.max(min.w, Math.min(max.w, this.w));

    return this;
  }

  clampScalar(minVal: number, maxVal: number) {
    return this.clamp(
        new Vector4(minVal, minVal, minVal, minVal),
        new Vector4(maxVal, maxVal, maxVal, maxVal));
  }

  clampLength(min: number, max: number) {
    const length = this.length();

    return this.divideScalar(length || 1)
        .multiplyScalar(Math.max(min, Math.min(max, length)));
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    this.w = Math.floor(this.w);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    this.w = Math.ceil(this.w);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    this.w = Math.round(this.w);
    return this;
  }

  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
    this.w = this.w < 0 ? Math.ceil(this.w) : Math.floor(this.w);
    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;
    this.w = -this.w;
    return this;
  }

  dot(v: Vector4) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  lengthSq() {
    return (
        this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  length() {
    return Math.sqrt(
        this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  manhattanLength() {
    return (
        Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) +
        Math.abs(this.w));
  }

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector4, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    this.w += (v.w - this.w) * alpha;
    return this;
  }

  equals(v: Vector4) {
    return v.x === this.x && v.y === this.y && v.z === this.z && v.w === this.w;
  }

  fromArray(array: number[], offset = 0) {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];
    this.w = array[offset + 3];
    return this;
  }

  toArray(array: number[] = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    array[offset + 2] = this.z;
    array[offset + 3] = this.w;
    return array;
  }

  fromBufferAttribute(attribute: BufferAttribute, index: number) {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    this.z = attribute.getZ(index);
    this.w = attribute.getW(index);
    return this;
  }
}
