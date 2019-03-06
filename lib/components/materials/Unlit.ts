import Color from '../../basis/Color';
import {XBind, XStore} from '../../basis/Components';

import {ColorUniform, MaterialBase, packMaterial} from './MaterialUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class Unlit implements MaterialBase {
  binds;
  uniforms;
  shaders = {
    vertexShaderProgram: `
attribute vec4 position;
uniform mat4 modelViewProjection;
uniform vec4 color;

varying vec4 var_color;

void main() {
  var_color = color;
  gl_Position = modelViewProjection * position;
}`,
    fragmentShaderProgram: `
precision mediump float;

varying vec4 var_color;

void main() {
  gl_FragColor = var_color;
}
`
  };
  constructor(color = new Color(Math.random() * 0xffffff)) {
    this.binds = {color: new XBind(color)};
    this.uniforms = {color: ColorUniform};
    packMaterial(this);
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    drawCall(gl.TRIANGLE_STRIP);
  }

  update() {}
}
