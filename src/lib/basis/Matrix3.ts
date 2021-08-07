/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import BufferAttribute from "./BufferAttribute";
import Matrix4 from "./Matrix4";
import Vector2 from "./Vector2";
import Vector3 from "./Vector3";

export default class Matrix3 {
  constructor(public elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {}

  static identity(): Matrix3 {
    return new Matrix3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  }

  static fromUvTransform(transform: {
    offset: Vector2;
    repeat: Vector2;
    rotation: number;
    pivot: Vector2;
  }): Matrix3 {
    const c = Math.cos(transform.rotation);
    const s = Math.sin(transform.rotation);
    const { x: ox, y: oy } = transform.offset;
    const { x: rx, y: ry } = transform.repeat;
    const { x: px, y: py } = transform.pivot;

    return new Matrix3([
      rx * c,
      rx * s,
      -rx * (c * px + s * py) + px + ox,
      -ry * s,
      ry * c,
      -ry * (-s * px + c * py) + py + oy,
      0,
      0,
      1,
    ]);
  }

  static fromMatrix4(m: Matrix4): Matrix3 {
    const me = m.elements;
    return new Matrix3([
      me[0],
      me[4],
      me[8],
      me[1],
      me[5],
      me[9],
      me[2],
      me[6],
      me[10],
    ]);
  }

  static multiplyMatrices(a: Matrix3, b: Matrix3): Matrix3 {
    const newM = new Matrix3();
    const ae = a.elements;
    const be = b.elements;
    const te = newM.elements;

    const [a11, a21, a31, a12, a22, a32, a13, a23, a33] = ae;
    const [b11, b21, b31, b12, b22, b32, b13, b23, b33] = be;

    te[0] = a11 * b11 + a12 * b21 + a13 * b31;
    te[3] = a11 * b12 + a12 * b22 + a13 * b32;
    te[6] = a11 * b13 + a12 * b23 + a13 * b33;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31;
    te[4] = a21 * b12 + a22 * b22 + a23 * b32;
    te[7] = a21 * b13 + a22 * b23 + a23 * b33;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31;
    te[5] = a31 * b12 + a32 * b22 + a33 * b32;
    te[8] = a31 * b13 + a32 * b23 + a33 * b33;

    return newM;
  }

  clone(): Matrix3 {
    const newM = new Matrix3();

    for (let i = 0; i < 9; i += 1) {
      newM.elements[i] = this.elements[i];
    }

    return newM;
  }

  copy(m: Matrix3): Matrix3 {
    this.elements = [...m.elements];
    return this;
  }

  applyToBufferAttribute(attribute: BufferAttribute): BufferAttribute {
    const v1 = new Vector3();
    for (let i = 0; i < attribute.count; i += 1) {
      v1.x = attribute.getX(i);
      v1.y = attribute.getY(i);
      v1.z = attribute.getZ(i);

      v1.applyMatrix3(this);

      attribute.setXYZ(i, { ...v1 });
    }

    return attribute;
  }

  multiply(m: Matrix3): Matrix3 {
    const ae = this.elements;
    const be = m.elements;

    const [a11, a21, a31, a12, a22, a32, a13, a23, a33] = ae;
    const [b11, b21, b31, b12, b22, b32, b13, b23, b33] = be;

    ae[0] = a11 * b11 + a12 * b21 + a13 * b31;
    ae[3] = a11 * b12 + a12 * b22 + a13 * b32;
    ae[6] = a11 * b13 + a12 * b23 + a13 * b33;

    ae[1] = a21 * b11 + a22 * b21 + a23 * b31;
    ae[4] = a21 * b12 + a22 * b22 + a23 * b32;
    ae[7] = a21 * b13 + a22 * b23 + a23 * b33;

    ae[2] = a31 * b11 + a32 * b21 + a33 * b31;
    ae[5] = a31 * b12 + a32 * b22 + a33 * b32;
    ae[8] = a31 * b13 + a32 * b23 + a33 * b33;

    return this;
  }

  premultiply(m: Matrix3): Matrix3 {
    return m.multiply(this);
  }

  multiplyScalar(s: number): Matrix3 {
    const te = this.elements;

    te[0] *= s;
    te[3] *= s;
    te[6] *= s;
    te[1] *= s;
    te[4] *= s;
    te[7] *= s;
    te[2] *= s;
    te[5] *= s;
    te[8] *= s;

    return this;
  }

  determinant(): number {
    const te = this.elements;

    const [a, b, c, d, e, f, g, h, i] = te;

    return (
      a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g
    );
  }

  inverse(m: Matrix3): Matrix3 {
    const me = m.elements,
      te = this.elements,
      [n11, n21, n31, n12, n22, n32, n13, n23, n33] = me,
      t11 = n33 * n22 - n32 * n23,
      t12 = n32 * n13 - n33 * n12,
      t13 = n23 * n12 - n22 * n13,
      det = this.determinant();

    if (det === 0) {
      console.error(`ArgumentError: The determinant of ${m} is 0.`);
      return Matrix3.identity();
    }

    const detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n31 * n23 - n33 * n21) * detInv;
    te[2] = (n32 * n21 - n31 * n22) * detInv;

    te[3] = t12 * detInv;
    te[4] = (n33 * n11 - n31 * n13) * detInv;
    te[5] = (n31 * n12 - n32 * n11) * detInv;

    te[6] = t13 * detInv;
    te[7] = (n21 * n13 - n23 * n11) * detInv;
    te[8] = (n22 * n11 - n21 * n12) * detInv;

    return this;
  }

  transpose(): Matrix3 {
    const m = this.elements;

    [m[1], m[3]] = [m[3], m[1]];
    [m[2], m[6]] = [m[6], m[2]];
    [m[5], m[7]] = [m[7], m[5]];
    return this;
  }

  normalMatrix(matrix4: Matrix4): Matrix3 {
    return Matrix3.fromMatrix4(matrix4).inverse(this).transpose();
  }

  elementsIntoArray(): number[] {
    return this.elements.slice();
  }

  scale(sx: number, sy: number): Matrix3 {
    const te = this.elements;

    te[0] *= sx;
    te[3] *= sx;
    te[6] *= sx;
    te[1] *= sy;
    te[4] *= sy;
    te[7] *= sy;

    return this;
  }

  rotate(theta: number): Matrix3 {
    const c = Math.cos(theta);
    const s = Math.sin(theta);

    const te = this.elements;

    const a11 = te[0],
      a12 = te[3],
      a13 = te[6];
    const a21 = te[1],
      a22 = te[4],
      a23 = te[7];

    te[0] = c * a11 + s * a21;
    te[3] = c * a12 + s * a22;
    te[6] = c * a13 + s * a23;

    te[1] = -s * a11 + c * a21;
    te[4] = -s * a12 + c * a22;
    te[7] = -s * a13 + c * a23;

    return this;
  }

  translate(tx: number, ty: number): Matrix3 {
    const te = this.elements;

    te[0] += tx * te[2];
    te[3] += tx * te[5];
    te[6] += tx * te[8];
    te[1] += ty * te[2];
    te[4] += ty * te[5];
    te[7] += ty * te[8];

    return this;
  }

  equals(matrix: Matrix3): boolean {
    const te = this.elements;
    const me = matrix.elements;

    for (let i = 0; i < 9; i += 1) {
      if (te[i] !== me[i]) {
        return false;
      }
    }

    return true;
  }

  toArray(array: number[] = [], offset = 0): number[] {
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

    return array;
  }
}
