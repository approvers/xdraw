import { Color } from "./Color";
import { Vector2 } from "./Vector2";
import { Vector3 } from "./Vector3";
import { Vector4 } from "./Vector4";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Int16Array
  | Uint16Array
  | Int32Array
  | Uint32Array
  | Float32Array;

export class BufferAttribute {
  public readonly count: number;

  public readonly isFloat: boolean;

  constructor(
    public readonly array: TypedArray,
    public readonly itemSize: number,
    private normalized = false,
  ) {
    this.count = array.length / itemSize;
    this.isFloat = array instanceof Float32Array;
  }

  get length(): number {
    return this.count;
  }

  clone(): BufferAttribute {
    const newB = new BufferAttribute(
      this.array,
      this.itemSize,
      this.normalized,
    );
    return newB;
  }

  getX(index: number): number {
    return this.array[index * this.itemSize];
  }

  getY(index: number): number {
    return this.array[index * this.itemSize + 1];
  }

  getZ(index: number): number {
    return this.array[index * this.itemSize + 2];
  }

  getW(index: number): number {
    return this.array[index * this.itemSize + 3];
  }

  setX(index: number, value: number): void {
    this.array[index * this.itemSize] = value;
  }

  setY(index: number, value: number): void {
    this.array[index * this.itemSize + 1] = value;
  }

  setZ(index: number, value: number): void {
    this.array[index * this.itemSize + 2] = value;
  }

  setW(index: number, value: number): void {
    this.array[index * this.itemSize + 3] = value;
  }

  setXY(index: number, xValue: number, yValue: number): BufferAttribute {
    this.array[index * this.itemSize + 0] = xValue;
    this.array[index * this.itemSize + 1] = yValue;

    return this;
  }

  setXYZ(
    index: number,
    { x, y, z }: { x: number; y: number; z: number },
  ): BufferAttribute {
    this.array[index * this.itemSize + 0] = x;
    this.array[index * this.itemSize + 1] = y;
    this.array[index * this.itemSize + 2] = z;

    return this;
  }

  setXYZW(
    index: number,
    { x, y, z, w }: { x: number; y: number; z: number; w: number },
  ): BufferAttribute {
    this.array[index * this.itemSize + 0] = x;
    this.array[index * this.itemSize + 1] = y;
    this.array[index * this.itemSize + 2] = z;
    this.array[index * this.itemSize + 3] = w;

    return this;
  }

  copyArray(array: ArrayLike<number>): BufferAttribute {
    this.array.set(array);
    return this;
  }

  copyColorsArray(colors: Color[]): BufferAttribute {
    const { array } = this;
    let offset = 0;

    for (let color of colors) {
      if (!color) {
        color = new Color(0);
      }

      array[offset + 0] = color.r;
      array[offset + 1] = color.g;
      array[offset + 2] = color.b;
      offset += 3;
    }

    return this;
  }

  copyVector2sArray(vectors: Vector2[]): BufferAttribute {
    const { array } = this;
    let offset = 0;

    for (let vector of vectors) {
      if (!vector) {
        vector = new Vector2();
      }

      array[offset + 0] = vector.x;
      array[offset + 1] = vector.y;
      offset += 2;
    }

    return this;
  }

  copyVector3sArray(vectors: Vector3[]): BufferAttribute {
    const { array } = this;
    let offset = 0;

    for (let vector of vectors) {
      if (!vector) {
        vector = new Vector3();
      }

      array[offset + 0] = vector.x;
      array[offset + 1] = vector.y;
      array[offset + 2] = vector.z;
      offset += 3;
    }

    return this;
  }

  copyVector4sArray(vectors: Vector4[]): BufferAttribute {
    const { array } = this;
    let offset = 0;

    for (let vector of vectors) {
      if (!vector) {
        vector = new Vector4();
      }

      array[offset + 0] = vector.x;
      array[offset + 1] = vector.y;
      array[offset + 2] = vector.z;
      array[offset + 3] = vector.w;
      offset += 4;
    }

    return this;
  }
}
