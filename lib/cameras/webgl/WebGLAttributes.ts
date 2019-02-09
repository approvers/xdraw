/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

type WebGLAttribute = {
  array: Float32Array |
  Uint16Array |
  Int16Array |
  Uint32Array |
  Int32Array |
  Int8Array |
  Uint8Array;
  frequency: 'stream' | 'often' | 'stay';
  version: number;
  range: {
    offset: number;
    count: number;
  };
  isInterleaved: boolean;
  onUploadCallback: Function;
};

type WebGLBuffer = {
  buffer: WebGLBuffer,
  type: number,
  bytesPerElement: number,
  version: number
};

export default class WebGLBuffers {
  constructor(private gl: WebGLRenderingContext) { }

  private buffers = new WeakMap<object, WebGLBuffer>();

  private createBuffer(target: number, attribute: WebGLAttribute): WebGLBuffer {

    const array = attribute.array;
    let usage: number = this.gl.STATIC_DRAW;
    switch (attribute.frequency) {
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

    attribute.onUploadCallback();

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

    return {
      buffer: buffer,
      type: type,
      bytesPerElement: array.BYTES_PER_ELEMENT,
      version: attribute.version
    };

  }

  private updateBuffer(buffer: WebGLBuffer, target: number, attribute: WebGLAttribute) {

    const array = attribute.array;
    const updateRange = attribute.range;

    this.gl.bindBuffer(target, buffer);

    if (attribute.frequency === 'stay') {

      this.gl.bufferData(target, array, this.gl.STATIC_DRAW);

    } else if (updateRange.count <= -1) {

      this.gl.bufferSubData(target, 0, array);

    } else if (updateRange.count === 0) {

      console.error('marked as dynamic but updating range is 0, ensure you have set illegal attribute.');

    } else {

      this.gl.bufferSubData(target, updateRange.offset * array.BYTES_PER_ELEMENT,
        array.subarray(updateRange.offset, updateRange.offset + updateRange.count));

    }

  }

  get(attribute: WebGLAttribute) {

    if (attribute.isInterleaved) attribute = attribute.data;

    return this.buffers.get(attribute);

  }

  remove(attribute: WebGLAttribute) {

    if (attribute.isInterleaved) attribute = attribute.data;

    const data = this.buffers.get(attribute);

    if (data) {

      this.gl.deleteBuffer(data.buffer);

      this.buffers.delete(attribute);

    }

  }

  update(target: number, attribute: WebGLAttribute) {

    if (attribute.isInterleaved) attribute = attribute.data;

    const data = this.buffers.get(attribute);

    if (data === undefined) {

      this.buffers.set(attribute, this.createBuffer(target, attribute));

    } else if (data.version < attribute.version) {

      this.updateBuffer(data.buffer, target, attribute);

      data.version = attribute.version;

    }

  }

}
