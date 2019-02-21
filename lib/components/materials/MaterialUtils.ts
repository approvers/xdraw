import BufferAttribute from '../../basis/BufferAttribute';
import Color from '../../basis/Color';
import {XBind, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

function extractAttributes(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const attributeCount = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
  const locations: {[name: string]: number} = {};
  for (let i = 0; i < attributeCount; ++i) {
    const attribute = gl.getActiveAttrib(program, i);
    if (attribute === null) continue;
    locations[attribute.name] = i;
  }
  return locations;
}

function extractUniforms(gl: WebGL2RenderingContext, program: WebGLProgram) {
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
  const uniforms: {[name: string]: number} = {};
  for (let i = 0; i < uniformCount; ++i) {
    const uniform = gl.getActiveUniform(program, i);
    if (uniform === null) continue;
    uniforms[uniform.name] = i;
  }
  return uniforms;
}

function compileShader(
    gl: WebGL2RenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (shader === null) throw new Error('Fail to create shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
  if (success) {
    return shader;
  }
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);
  throw new Error('Fail to compile shader.')
}

export type ShaderProgramSet = {
  vertexShaderProgram: string,
  fragmentShaderProgram: string
};

const makeShader =
    (programSet: ShaderProgramSet) => (gl: WebGL2RenderingContext) => {
      const vertexShader =
          compileShader(gl, gl.VERTEX_SHADER, programSet.vertexShaderProgram);
      const fragmentShader = compileShader(
          gl, gl.FRAGMENT_SHADER, programSet.fragmentShaderProgram);
      const program = gl.createProgram();
      if (program === null) throw new Error('Fail to create program.');
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (success) {
        return {
          use: () => {
            gl.useProgram(program);
          },
          uniforms: extractUniforms(gl, program),
          attributes: extractAttributes(gl, program)
        };
      }

      console.error(gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      throw new Error('Fail to link shaders.')
    }

export type UniformUpdater =
    (location: WebGLUniformLocation, gl: WebGL2RenderingContext, newV: any) =>
        void;

const bindWithUniforms =
    (binds: {[key: string]: XBind<any>},
     uniforms: {[locationName: string]: UniformUpdater}) =>
        (locations: {[locationName: string]: WebGLUniformLocation}) =>
            (gl: WebGL2RenderingContext) => {
              Object.keys(uniforms).forEach(key => {
                const bind = binds[key];
                if (bind === undefined) return;
                bind.addListener((v) => {
                  uniforms[key](locations[key], gl, v);
                });
              });
            };

const packMaterial =
    (store: XStore,
     renderer: (gl: WebGL2RenderingContext, drawCall: (mode: number) => void) =>
         void,
     shaders: ShaderProgramSet,
     uniforms: {[locationName: string]: UniformUpdater;}) => {
      store.set('material', {
        uniforms:
            bindWithUniforms(store.getBindsStartsWith('material.'), uniforms),
        renderer,
        shader: makeShader(shaders)
      });
    };

const MaterialBase =
    (body: (store: XStore, transform: Transform) => void,
     uniforms: {[locationName: string]: UniformUpdater;},
     renderer: (gl: WebGL2RenderingContext, drawCall: (mode: number) => void) =>
         void,
     shaders: ShaderProgramSet = {
       vertexShaderProgram: `
attribute vec4 position;
void main() {
  gl_Position = position;
}
`,
       fragmentShaderProgram: `
precision mediump float;

void main() {
  gl_FragColor = vec4(1, 0, 0.5, 1);
}
`
     }) => (store: XStore, transform: Transform) => {
      body(store, transform);
      packMaterial(store, renderer, shaders, uniforms);
      return store;
    };


export default MaterialBase;

export const ColorUniform =
    (loc: WebGLUniformLocation, gl: WebGL2RenderingContext, color: Color) => {
      gl.uniform4f(loc, color.r, color.g, color.b, color.a);
    }