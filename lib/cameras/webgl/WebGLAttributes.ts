/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from "../../basis/BufferAttribute";
import InterleavedBufferAttribute from "../../basis/InterleavedBufferAttribute";

export class WebGLAttribute {
  version: number;
  type: number;
  range: {
    offset: number;
    count: number;
    stride: number;
  };
  isInterleaved = false;
  onUpload: Function;

  static fromBufferAttribute(gl: WebGLRenderingContext, target: number, bufferAttribute: BufferAttribute) {
    const newW = new WebGLAttribute(gl, target, bufferAttribute.array, bufferAttribute.needsUpdate ? 'often' : 'stay');
    newW.range.count = bufferAttribute.count;
    return newW;
  }

  static fromInterleavedBufferAttribute(gl: WebGLRenderingContext, target: number, bufferAttribute: InterleavedBufferAttribute) {
    const newW = new WebGLAttribute(gl, target, bufferAttribute.array, bufferAttribute.needsUpdate ? 'often' : 'stay');
    newW.range.count = bufferAttribute.count;
    newW.range.offset = bufferAttribute.offset;
    newW.range.stride = bufferAttribute.stride;
    newW.isInterleaved = true;
    return newW;
  }

  private buffer: WebGLBuffer;

  constructor(private gl: WebGLRenderingContext, public target: number,
    public array: Float32Array |
      Uint16Array |
      Int16Array |
      Uint32Array |
      Int32Array |
      Int8Array |
      Uint8Array,
    public frequency: 'stream' | 'often' | 'stay') {

    let usage: number = this.gl.STATIC_DRAW;
    switch (frequency) {
      case 'stream':
        usage = this.gl.STREAM_DRAW;
        break;
      case 'often':
        usage = this.gl.DYNAMIC_DRAW;
        break;
      case 'stay':
        usage = this.gl.STATIC_DRAW;
        break;
    }

    const buffer = this.gl.createBuffer();

    if (buffer === null) {
      throw new Error("WebGLRenderingContext.createBuffer has failed.");
    }

    this.gl.bindBuffer(target, buffer);
    this.gl.bufferData(target, array, usage);

    let type = this.gl.FLOAT;

    if (array instanceof Float32Array) {

      type = this.gl.FLOAT;

    } else if (array instanceof Uint16Array) {

      type = this.gl.UNSIGNED_SHORT;

    } else if (array instanceof Int16Array) {

      type = this.gl.SHORT;

    } else if (array instanceof Uint32Array) {

      type = this.gl.UNSIGNED_INT;

    } else if (array instanceof Int32Array) {

      type = this.gl.INT;

    } else if (array instanceof Int8Array) {

      type = this.gl.BYTE;

    } else if (array instanceof Uint8Array) {

      type = this.gl.UNSIGNED_BYTE;

    }
    this.type = type;
  }

  active() {
    const array = this.array;
    const updateRange = this.range;

    this.gl.bindBuffer(this.target, this.buffer);

    if (this.frequency === 'stay') {

      this.gl.bufferData(this.target, array, this.gl.STATIC_DRAW);

    } else if (updateRange.count <= -1) {

      this.gl.bufferSubData(this.target, 0, array);

    } else if (updateRange.count === 0) {

      console.error('marked as dynamic but updating range is 0, ensure you have set illegal attribute.');

    } else {

      this.gl.bufferSubData(this.target, updateRange.offset * array.BYTES_PER_ELEMENT,
        array.subarray(updateRange.offset, updateRange.offset + updateRange.count));

    }
    this.onUpload(this);
  }
};

export default class WebGLAttributes {
  constructor(private gl: WebGLRenderingContext, private program: WebGLProgram) { }

  private attributes: { [name: string]: WebGLAttribute }[];

  addAttributes(index: number, array: Float32Array |
    Uint16Array |
    Int16Array |
    Uint32Array |
    Int32Array |
    Int8Array |
    Uint8Array,
    frequency: 'stream' | 'often' | 'stay') {
    const info = this.gl.getActiveAttrib(this.program, index);
    if (info === null) return;
    this.attributes[info.name] =
      new WebGLAttribute(this.gl, this.gl.getAttribLocation(this.program, info.name), array, frequency);

  }

  targetId(name: string) {
    return this.attributes[name].target || -1;
  }

  get(name: string) {
    return this.attributes[name];
  }

  remove(name: string) {
    delete this.attributes[name];
  }
}
