import Color from '../../basis/Color';
import {XBind} from '../../basis/Components';
import Vector3 from '../../basis/Vector3';

import {ColorUniform, MaterialBase, Uniforms, Vector3Uniform} from './MaterialUtils';

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

type DiffuseProps = {
  color: Color,
};

export default class Diffuse implements MaterialBase<DiffuseProps> {
  defaultProps: DiffuseProps;
  uniforms: {color: typeof ColorUniform, light: typeof Vector3Uniform};

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
`
  };

  constructor(
      private light: {props: {intensity: number}},
      color = new Color(Math.random() * 0xffffff)) {
    this.defaultProps = {color};
    this.uniforms = {color: ColorUniform, light: Vector3Uniform};
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    gl.enable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST);
    // gl.depthFunc(gl.LEQUAL);
    drawCall(gl.TRIANGLES);
    // gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
  }
}
