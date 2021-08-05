import Color from "../../basis/Color";

import Material, { ColorUniform } from "./Material";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Lines extends Material {
  uniforms: { color: typeof ColorUniform };

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
`,
  };

  constructor(color = new Color(Math.random() * 0xffffff)) {
    super({ color: { initValue: color } });
    this.uniforms = { color: ColorUniform };
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    drawCall(gl.LINE_STRIP);
  }
}
