import Color from '../../basis/Color';
import {XBind} from '../../basis/Components';

import {ColorUniform, extractLight, MaterialBase, packMaterial, Vector3Uniform} from './MaterialUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class Diffuse implements MaterialBase {
  binds;
  uniforms;
  update = [];
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

  constructor(color = new Color(Math.random() * 0xffffff)) {
    this.binds = {color: new XBind(color), light: extractLight(this)};
    this.uniforms = {color: ColorUniform, light: Vector3Uniform};
    packMaterial(this);
  }

  render(gl: WebGL2RenderingContext, drawCall: (mode: number) => void) {
    gl.enable(gl.CULL_FACE);
    // gl.enable(gl.DEPTH_TEST);
    drawCall(gl.TRIANGLES);
  }
}
