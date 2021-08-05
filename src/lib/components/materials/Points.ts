import { PropsBase } from "../../basis/Component";

import Material, { ColorUniform } from "./Material";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Points extends Material {
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

  constructor(props: PropsBase) {
    super(props);
    this.uniforms.color = ColorUniform;
    this.store.addProp("color", Math.random() * 0xffffff);
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    drawCall(gl.POINTS);
  }
}
