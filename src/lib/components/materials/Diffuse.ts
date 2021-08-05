/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from "../../basis/Color";

import Material, { ColorUniform, Vector3Uniform } from "./Material";

export default class Diffuse extends Material {
  uniforms = { color: ColorUniform,
light: Vector3Uniform };

  shaders = {
    vertexShaderProgram: `
attribute vec4 position;
attribute vec4 normal;
uniform mat4 modelViewProjection;

varying vec4 var_normal;

void main() {
  var_normal = modelViewProjection * normal;
  gl_Position = modelViewProjection * position;
}`,
    fragmentShaderProgram: `
precision mediump float;

uniform vec4 color;
uniform vec3 light;

varying vec4 var_normal;

void main() {
  vec3 normal = normalize(vec3(var_normal));
  float opac = dot(normal, light);
  gl_FragColor = color;
  gl_FragColor.rgb *= opac;
}
`,
  };

  constructor(color = new Color(Math.random() * 0xffffff)) {
    super({ color: { initValue: color } });
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    gl.enable(gl.CULL_FACE);

    /*
     * Gl.enable(gl.DEPTH_TEST);
     * gl.depthFunc(gl.LEQUAL);
     */
    drawCall(gl.TRIANGLES);
    // Gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
  }
}
