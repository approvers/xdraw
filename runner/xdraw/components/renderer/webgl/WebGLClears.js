"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
    * @author RkEclair / https://github.com/RkEclair
    */
class WebGLClears {
    constructor(gl) {
        this.gl = gl;
        this.clearMask = 0;
    }
    set color(v) {
        this.gl.clearColor(v.r / 0xff, v.g / 0xff, v.b / 0xff, v.a / 0xff);
        this.clearMask |= this.gl.COLOR_BUFFER_BIT;
    }
    set depth(v) {
        this.gl.clearDepth(Math.min(Math.max(v, 0), 1));
        this.clearMask |= this.gl.DEPTH_BUFFER_BIT;
    }
    set stencil(v) {
        this.gl.clearStencil(v);
        this.clearMask |= this.gl.STENCIL_BUFFER_BIT;
    }
    do() {
        this.gl.clear(this.clearMask);
    }
}
exports.default = WebGLClears;
