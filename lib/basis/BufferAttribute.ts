import Color from './Color';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export type TypedArray =|Int8Array|Uint8Array|Int16Array|Uint16Array|Int32Array|
    Uint32Array|Float32Array;

export default class BufferAttribute {
  public readonly count: number;
  public readonly isFloat: boolean;

  set needsUpdate(v: boolean) {
    if (v === true) {
      ;
    }
  }

  static fromArray<T extends TypedArray>(
      buffer: new(any: any) => T, array: number[], itemSize: number,
      normalized = false) {
    return new BufferAttribute(new buffer(array), itemSize, normalized);
  }

  constructor(
      public readonly array: TypedArray, public readonly itemSize: number,
      private normalized = false) {
    this.count = array.length / itemSize;
    this.isFloat = array instanceof Float32Array;
  }

  get length() {
    return this.count;
  }

  clone() {
    const newB =
        new BufferAttribute(this.array, this.itemSize, this.normalized);
    newB.needsUpdate = this.needsUpdate;
    return newB;
  }

  getX(i: number) {
    return this.array[i * this.itemSize];
  }

  getY(i: number) {
    return this.array[i * this.itemSize + 1];
  }

  getZ(i: number) {
    return this.array[i * this.itemSize + 2];
  }

  getW(i: number) {
    return this.array[i * this.itemSize + 3];
  }

  setX(i: number, v: number) {
    this.array[i * this.itemSize] = v;
  }

  setY(i: number, v: number) {
    this.array[i * this.itemSize + 1] = v;
  }

  setZ(i: number, v: number) {
    this.array[i * this.itemSize + 2] = v;
  }

  setW(i: number, v: number) {
    this.array[i * this.itemSize + 3] = v;
  }

  setXY(index: number, x: number, y: number) {
    index *= this.itemSize;

    this.array[index + 0] = x;
    this.array[index + 1] = y;

    return this;
  }

  setXYZ(index: number, x: number, y: number, z: number) {
    index *= this.itemSize;

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;

    return this;
  }

  setXYZW(index: number, x: number, y: number, z: number, w: number) {
    index *= this.itemSize;

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    this.array[index + 3] = w;

    return this;
  }

  copyArray(array: ArrayLike<number>) {
    this.array.set(array);
    return this;
  }

  copyColorsArray(colors: Color[]) {
    const array = this.array;
    let offset = 0;

    for (let color of colors) {
      if (color === undefined) {
        color = new Color(0);
      }

      array[offset++] = color.r;
      array[offset++] = color.g;
      array[offset++] = color.b;
    }

    return this;
  }

  copyVector2sArray(vectors: Vector2[]) {
    const array = this.array;
    let offset = 0;

    for (let vector of vectors) {
      if (vector === undefined) {
        vector = new Vector2();
      }

      array[offset++] = vector.x;
      array[offset++] = vector.y;
    }

    return this;
  }

  copyVector3sArray(vectors: Vector3[]) {
    const array = this.array;
    let offset = 0;

    for (let vector of vectors) {
      if (vector === undefined) {
        vector = new Vector3();
      }

      array[offset++] = vector.x;
      array[offset++] = vector.y;
      array[offset++] = vector.z;
    }

    return this;
  }

  copyVector4sArray(vectors: Vector4[]) {
    const array = this.array;
    let offset = 0;

    for (let vector of vectors) {
      if (vector === undefined) {
        vector = new Vector4();
      }

      array[offset++] = vector.x;
      array[offset++] = vector.y;
      array[offset++] = vector.z;
      array[offset++] = vector.w;
    }

    return this;
  }
}
