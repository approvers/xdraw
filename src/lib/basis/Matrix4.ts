/**
 * @author mrdoob / http://mrdoob.com/
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author philogb / http://blog.thejit.org/
 * @author jordi_ros / http://plattsoft.com
 * @author D1plo1d / http://github.com/D1plo1d
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author timknip / http://www.floorplanner.com/
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Quaternion from './Quaternion';
import Vector3 from './Vector3';

export default class Matrix4 {
  constructor(public elements: number[] = [
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1
  ]) {}

  static zero() {
    return new Matrix4([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  }

  static identity() {
    return new Matrix4([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
  }

  static extractRotation(m: Matrix4) {  // does not support reflection matrices

    const newM = new Matrix4(), te = newM.elements;
    const me = m.elements;

    const scaleX = 1 / Vector3.fromMatrixColumn(m, 0).length();
    const scaleY = 1 / Vector3.fromMatrixColumn(m, 1).length();
    const scaleZ = 1 / Vector3.fromMatrixColumn(m, 2).length();

    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;
    te[3] = 0;

    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;
    te[7] = 0;

    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;
    te[11] = 0;

    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return newM;
  }

  static projection(width: number, height: number, depth: number) {
    return new Matrix4([
      2 / width, 0, 0, 0, 0, 2 / height, 0, 0, 0, 0, 2 / depth, 0, -1, 1, 0, 1
    ]);
  }

  static perspective(fov: number, aspect: number, near: number, far: number) {
    const f = Math.tan(0.5 * (Math.PI - fov));
    const rangeInv = 1.0 / (near - far);

    return new Matrix4([
      f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (near + far) * rangeInv, -1, 0, 0,
      near * far * rangeInv * 2, 0
    ]);
  }

  clone() {
    return new Matrix4(this.elements.slice());
  }

  equals(m: Matrix4) {
    return this.elements.every((e, i) => e === m.elements[i]);
  }

  toArray(offset: number = 0) {
    const array: number[] = [];

    const te = this.elements;

    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];

    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];

    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];

    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];

    return array;
  }

  multiply(m: Matrix4) {
    const newM = this.clone();
    const ae = newM.elements;
    const be = m.elements;

    const a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    const a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

    const b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    const b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

    ae[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    ae[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    ae[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    ae[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    ae[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    ae[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    ae[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    ae[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    ae[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    ae[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    ae[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    ae[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    ae[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    ae[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    ae[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    ae[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;
    return newM;
  }

  maxScaleOnAxis() {
    const te = this.elements;

    const scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    const scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    const scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }

  inverse() {
    const det = this.determinant();
    if (det === 0) {
      console.error(`ArgumentError: The determinant is 0.`);
      return Matrix4.identity();
    }
    const m = this.elements;
    const invM = new Matrix4(), inv = invM.elements;

    inv[0] = m[5] * m[10] * m[15] - m[5] * m[11] * m[14] - m[9] * m[6] * m[15] +
        m[9] * m[7] * m[14] + m[13] * m[6] * m[11] - m[13] * m[7] * m[10];

    inv[4] = -m[4] * m[10] * m[15] + m[4] * m[11] * m[14] +
        m[8] * m[6] * m[15] - m[8] * m[7] * m[14] - m[12] * m[6] * m[11] +
        m[12] * m[7] * m[10];

    inv[8] = m[4] * m[9] * m[15] - m[4] * m[11] * m[13] - m[8] * m[5] * m[15] +
        m[8] * m[7] * m[13] + m[12] * m[5] * m[11] - m[12] * m[7] * m[9];

    inv[12] = -m[4] * m[9] * m[14] + m[4] * m[10] * m[13] +
        m[8] * m[5] * m[14] - m[8] * m[6] * m[13] - m[12] * m[5] * m[10] +
        m[12] * m[6] * m[9];

    inv[1] = -m[1] * m[10] * m[15] + m[1] * m[11] * m[14] +
        m[9] * m[2] * m[15] - m[9] * m[3] * m[14] - m[13] * m[2] * m[11] +
        m[13] * m[3] * m[10];

    inv[5] = m[0] * m[10] * m[15] - m[0] * m[11] * m[14] - m[8] * m[2] * m[15] +
        m[8] * m[3] * m[14] + m[12] * m[2] * m[11] - m[12] * m[3] * m[10];

    inv[9] = -m[0] * m[9] * m[15] + m[0] * m[11] * m[13] + m[8] * m[1] * m[15] -
        m[8] * m[3] * m[13] - m[12] * m[1] * m[11] + m[12] * m[3] * m[9];

    inv[13] = m[0] * m[9] * m[14] - m[0] * m[10] * m[13] - m[8] * m[1] * m[14] +
        m[8] * m[2] * m[13] + m[12] * m[1] * m[10] - m[12] * m[2] * m[9];

    inv[2] = m[1] * m[6] * m[15] - m[1] * m[7] * m[14] - m[5] * m[2] * m[15] +
        m[5] * m[3] * m[14] + m[13] * m[2] * m[7] - m[13] * m[3] * m[6];

    inv[6] = -m[0] * m[6] * m[15] + m[0] * m[7] * m[14] + m[4] * m[2] * m[15] -
        m[4] * m[3] * m[14] - m[12] * m[2] * m[7] + m[12] * m[3] * m[6];

    inv[10] = m[0] * m[5] * m[15] - m[0] * m[7] * m[13] - m[4] * m[1] * m[15] +
        m[4] * m[3] * m[13] + m[12] * m[1] * m[7] - m[12] * m[3] * m[5];

    inv[14] = -m[0] * m[5] * m[14] + m[0] * m[6] * m[13] + m[4] * m[1] * m[14] -
        m[4] * m[2] * m[13] - m[12] * m[1] * m[6] + m[12] * m[2] * m[5];

    inv[3] = -m[1] * m[6] * m[11] + m[1] * m[7] * m[10] + m[5] * m[2] * m[11] -
        m[5] * m[3] * m[10] - m[9] * m[2] * m[7] + m[9] * m[3] * m[6];

    inv[7] = m[0] * m[6] * m[11] - m[0] * m[7] * m[10] - m[4] * m[2] * m[11] +
        m[4] * m[3] * m[10] + m[8] * m[2] * m[7] - m[8] * m[3] * m[6];

    inv[11] = -m[0] * m[5] * m[11] + m[0] * m[7] * m[9] + m[4] * m[1] * m[11] -
        m[4] * m[3] * m[9] - m[8] * m[1] * m[7] + m[8] * m[3] * m[5];

    inv[15] = m[0] * m[5] * m[10] - m[0] * m[6] * m[9] - m[4] * m[1] * m[10] +
        m[4] * m[2] * m[9] + m[8] * m[1] * m[6] - m[8] * m[2] * m[5];

    return invM.multiplyScalar(1 / det);
  }

  static makeRotationFromQuaternion(q: Quaternion) {
    return Matrix4.compose(new Vector3(0, 0, 0), q, new Vector3(1, 1, 1));
  }

  static compose(position: Vector3, quaternion: Quaternion, scale: Vector3) {
    const te: number[] = [];
    const {x: sx, y: sy, z: sz} = scale;
    const {x, y, z, w} = quaternion;
    const x2 = x + x, y2 = y + y, z2 = z + z;
    const xx = x * x2, xy = x * y2, xz = x * z2;
    const yy = y * y2, yz = y * z2, zz = z * z2;
    const wx = w * x2, wy = w * y2, wz = w * z2;

    te[0] = (1 - (yy + zz)) * sx;
    te[1] = (xy + wz) * sx;
    te[2] = (xz - wy) * sx;
    te[3] = 0;

    te[4] = (xy - wz) * sy;
    te[5] = (1 - (xx + zz)) * sy;
    te[6] = (yz + wx) * sy;
    te[7] = 0;

    te[8] = (xz + wy) * sz;
    te[9] = (yz - wx) * sz;
    te[10] = (1 - (xx + yy)) * sz;
    te[11] = 0;

    te[12] = position.x;
    te[13] = position.y;
    te[14] = position.z;
    te[15] = 1;

    return new Matrix4(te);
  }

  decompose(): {position: Vector3, quaternion: Quaternion, scale: Vector3} {
    const te = this.elements;
    const position = new Vector3();
    const sx = new Vector3(te[0], te[1], te[2]).length();
    const sy = new Vector3(te[4], te[5], te[6]).length();
    const sz = new Vector3(te[8], te[9], te[10]).length();

    // if determine is negative, we need to invert one scale
    const det = this.determinant();
    const scale = new Vector3((det < 0) ? -sx : sx, sy, sz);

    position.x = te[12];
    position.y = te[13];
    position.z = te[14];

    // scale the rotation part
    const matrix = new Matrix4();

    const invSX = 1 / sx;
    const invSY = 1 / sy;
    const invSZ = 1 / sz;

    matrix.elements[0] *= invSX;
    matrix.elements[1] *= invSX;
    matrix.elements[2] *= invSX;

    matrix.elements[4] *= invSY;
    matrix.elements[5] *= invSY;
    matrix.elements[6] *= invSY;

    matrix.elements[8] *= invSZ;
    matrix.elements[9] *= invSZ;
    matrix.elements[10] *= invSZ;

    const quaternion = Quaternion.fromRotationMatrix(matrix);

    return {position, quaternion, scale};
  }

  determinant() {
    const te = this.elements;

    const n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
    const n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
    const n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
    const n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

    // TODO: make this more efficient
    //( based on
    // http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    //)

    return (
        n41 *
            (+n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 +
             n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34) +
        n42 *
            (+n11 * n23 * n34 - n11 * n24 * n33 + n14 * n21 * n33 -
             n13 * n21 * n34 + n13 * n24 * n31 - n14 * n23 * n31) +
        n43 *
            (+n11 * n24 * n32 - n11 * n22 * n34 - n14 * n21 * n32 +
             n12 * n21 * n34 + n14 * n22 * n31 - n12 * n24 * n31) +
        n44 *
            (-n13 * n22 * n31 - n11 * n23 * n32 + n11 * n22 * n33 +
             n13 * n21 * n32 - n12 * n21 * n33 + n12 * n23 * n31)

    );
  }

  multiplyScalar(x: number) {
    return new Matrix4(this.elements.map(e => e * x));
  }

  static lookAt(eye: Vector3, target: Vector3, up: Vector3) {
    const newM = new Matrix4(), te = newM.elements;
    const z = eye.sub(target);

    if (z.lengthSq() === 0) {
      // eye and target are in the same position
      z.z = 1;
    }

    z.normalize();
    let x = up.cross(z);

    if (x.lengthSq() === 0) {
      // up and z are parallel
      if (Math.abs(up.z) === 1) {
        z.x += 0.0001;
      } else {
        z.z += 0.0001;
      }
      z.normalize();
      x = up.cross(z);
    }

    x.normalize();
    const y = z.cross(x);

    te[0] = x.x;
    te[4] = y.x;
    te[8] = z.x;
    te[1] = x.y;
    te[5] = y.y;
    te[9] = z.y;
    te[2] = x.z;
    te[6] = y.z;
    te[10] = z.z;

    return newM;
  }
}
