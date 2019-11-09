import Color from '../../basis/Color';

import {ColorUniform, MaterialBase, packMaterial} from './Material';

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

type LinesProps = {
  color: Color,
};

export default class Lines implements MaterialBase<LinesProps> {
  defaultProps: LinesProps;
  uniforms: {color: typeof ColorUniform};
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
    this.defaultProps = {color};
    this.uniforms = {color: ColorUniform};
    packMaterial(this);
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    drawCall(gl.LINE_STRIP);
  }
}
