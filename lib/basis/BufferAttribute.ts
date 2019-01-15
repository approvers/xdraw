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

  static fromArray<T extends TypedArray>(
    buffer: new (any) => T,
    array: number[],
    itemSize: number,
    normalized = false
  ) {
    return new BufferAttribute(new buffer(array), itemSize, normalized);
  }

  constructor(
    private array: TypedArray,
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
}
