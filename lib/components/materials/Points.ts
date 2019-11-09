import Color from '../../basis/Color';
import {XBind} from '../../basis/Components';

import {ColorUniform, MaterialBase, packMaterial} from './Material';

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Points implements MaterialBase {
  binds;
  uniforms;
  update = [];
  shaders = {
    vertexShaderProgram: `
attribute vec4 position;
uniform mat4 modelViewProjection;

void main() {
  gl_Position = modelViewProjection * position;
}`,
    fragmentShaderProgram: `
precision mediump float;

uniform vec4 color;

void main() {
  gl_FragColor = color;
}
`
  };
  constructor(color = new Color(Math.random() * 0xffffff)) {
    this.binds = {color: new XBind(color)};
    this.uniforms = {color: ColorUniform};
    packMaterial(this);
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    drawCall(gl.POINTS);
  }
}
