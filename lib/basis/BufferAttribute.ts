import Vector4 from "./Vector4";
import Vector3 from "./Vector3";
import Vector2 from "./Vector2";
import Color from "./Color";

/**
 * @author RkEclair / https://github.com/RkEclair
 */
type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array
  | Float64Array;

export default class BufferAttribute {
  count: number;
  needsUpdate: boolean;

  static fromArray<T extends TypedArray>(
    buffer: new (any) => T,
    array: number[],
    itemSize: number,
    normalized = false
  ) {
    return new BufferAttribute(new buffer(array), itemSize, normalized);
  }

  constructor(
    public array: TypedArray,
    private itemSize: number,
    private normalized = false
  ) {
    this.count = array.length / itemSize;
  }

  getX(i: number) {
    return this.array[i * this.itemSize];
  }

  getY(i: number) {
    return this.array[i * this.itemSize];
  }

  getZ(i: number) {
    return this.array[i * this.itemSize];
  }

  copyArray(array: any[]) {
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
