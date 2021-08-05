import Color from "../../../basis/Color";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class WebGLClears {
  constructor(private gl: WebGL2RenderingContext) {}

  clearMask = 0;

  set color(v: Color) {
    this.gl.clearColor(v.r, v.g, v.b, v.a);
    this.clearMask |= this.gl.COLOR_BUFFER_BIT;
  }

  set depth(v: number) {
    this.gl.clearDepth(Math.min(Math.max(v, 0), 1));
    this.clearMask |= this.gl.DEPTH_BUFFER_BIT;
  }

  set stencil(v: number) {
    this.gl.clearStencil(v);
    this.clearMask |= this.gl.STENCIL_BUFFER_BIT;
  }

  clear() {
    this.gl.clear(this.clearMask);
  }
}
