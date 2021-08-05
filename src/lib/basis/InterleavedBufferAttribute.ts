/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {TypedArray} from './BufferAttribute';

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

  set needsUpdate(value) {
    if (value === true) this.version++;
  }

  copyAt(
      srcOffset: number, attribute: InterleavedBufferAttribute,
      dstOffset: number) {
    srcOffset *= this.stride;
    dstOffset *= attribute.stride;

    for (let i = 0; i < this.stride; i++) {
      this.array[srcOffset + i] = attribute.array[dstOffset + i];
    }

    return this;
  }

  set(value: TypedArray, offset = 0) {
    this.array.set(value, offset);
    return this;
  }

  clone() {
    const newI =
        new InterleavedBufferAttribute(this.array.slice(), this.stride);
    newI.dynamic = this.dynamic;
    return newI;
  }

  setX(index: number, x: number) {
    this.array[index * this.stride + this.offset] = x;

    return this;
  }

  setY(index: number, y: number) {
    this.array[index * this.stride + this.offset + 1] = y;

    return this;
  }

  setZ(index: number, z: number) {
    this.array[index * this.stride + this.offset + 2] = z;

    return this;
  }

  setW(index: number, w: number) {
    this.array[index * this.stride + this.offset + 3] = w;

    return this;
  }

  getX(index: number) {
    return this.array[index * this.stride + this.offset];
  }

  getY(index: number) {
    return this.array[index * this.stride + this.offset + 1];
  }

  getZ(index: number) {
    return this.array[index * this.stride + this.offset + 2];
  }

  getW(index: number) {
    return this.array[index * this.stride + this.offset + 3];
  }

  setXY(index: number, x: number, y: number) {
    index = index * this.stride + this.offset;

    this.array[index + 0] = x;
    this.array[index + 1] = y;

    return this;
  }

  setXYZ(index: number, x: number, y: number, z: number) {
    index = index * this.stride + this.offset;

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;

    return this;
  }

  setXYZW(index: number, x: number, y: number, z: number, w: number) {
    index = index * this.stride + this.offset;

    this.array[index + 0] = x;
    this.array[index + 1] = y;
    this.array[index + 2] = z;
    this.array[index + 3] = w;

    return this;
  }
}
