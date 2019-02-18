import BufferAttribute from "../../../basis/BufferAttribute";

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLBufferFactory {
  constructor(private gl: WebGLRenderingContext) {}

  makeStaticBuffer(nums: BufferAttribute) {
    const buffer = this.gl.createBuffer();
    if (buffer === null) throw new Error('Fail to create buffer.');
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, nums.array, this.gl.STATIC_DRAW);
    if (nums.length <= 0) return undefined;
    return buffer;
  }
}