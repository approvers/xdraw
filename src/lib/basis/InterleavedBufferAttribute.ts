/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author MikuroXina / https://github.com/MikuroXina
 */

import { TypedArray } from "./BufferAttribute";

export default class InterleavedBufferAttribute {
  public readonly count: number;

  public readonly isFloat: boolean;

  dynamic = false;

  offset = 0;

  version = 0;

  constructor(public array: TypedArray, public stride: number) {
    this.count = array.length / stride;
    this.isFloat = array instanceof Float32Array;
  }

  setNeedsUpdate(value: boolean): void {
    if (value === true) {
      this.version += 1;
    }
  }

  copyAt(
    srcOffset: number,
    attribute: InterleavedBufferAttribute,
    dstOffset: number,
  ): InterleavedBufferAttribute {
    const src = srcOffset * this.stride;
    const dst = dstOffset * attribute.stride;

    for (let i = 0; i < this.stride; i += 1) {
      this.array[src + i] = attribute.array[dst + i];
    }

    return this;
  }

  set(value: TypedArray, offset = 0): InterleavedBufferAttribute {
    this.array.set(value, offset);
    return this;
  }

  clone(): InterleavedBufferAttribute {
    const newI = new InterleavedBufferAttribute(
      this.array.slice(),
      this.stride,
    );
    newI.dynamic = this.dynamic;
    return newI;
  }

  setX(index: number, x: number): InterleavedBufferAttribute {
    this.array[index * this.stride + this.offset] = x;

    return this;
  }

  setY(index: number, y: number): InterleavedBufferAttribute {
    this.array[index * this.stride + this.offset + 1] = y;

    return this;
  }

  setZ(index: number, z: number): InterleavedBufferAttribute {
    this.array[index * this.stride + this.offset + 2] = z;

    return this;
  }

  setW(index: number, w: number): InterleavedBufferAttribute {
    this.array[index * this.stride + this.offset + 3] = w;

    return this;
  }

  getX(index: number): number {
    return this.array[index * this.stride + this.offset];
  }

  getY(index: number): number {
    return this.array[index * this.stride + this.offset + 1];
  }

  getZ(index: number): number {
    return this.array[index * this.stride + this.offset + 2];
  }

  getW(index: number): number {
    return this.array[index * this.stride + this.offset + 3];
  }

  setXY(index: number, x: number, y: number): InterleavedBufferAttribute {
    const i = index * this.stride + this.offset;

    this.array[i + 0] = x;
    this.array[i + 1] = y;

    return this;
  }

  setXYZ(
    index: number,
    { x, y, z }: { x: number; y: number; z: number },
  ): InterleavedBufferAttribute {
    const i = index * this.stride + this.offset;

    this.array[i + 0] = x;
    this.array[i + 1] = y;
    this.array[i + 2] = z;

    return this;
  }

  setXYZW(
    index: number,
    { x, y, z, w }: { x: number; y: number; z: number; w: number },
  ): InterleavedBufferAttribute {
    const i = index * this.stride + this.offset;

    this.array[i + 0] = x;
    this.array[i + 1] = y;
    this.array[i + 2] = z;
    this.array[i + 3] = w;

    return this;
  }
}
