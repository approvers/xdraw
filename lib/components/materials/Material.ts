import {XStore} from '../../basis/Components';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export interface ShaderSet {
  vertexShader: string;
  fragmentShader: string;
}

export interface Shader {
  uniforms: {[locationName: string]: Float32Array|Int32Array;};
  shaders?: ShaderSet;
}

export function packMaterial(store: XStore, shader: Shader) {
  const shaders = (store.get('shaders') || []) as Shader[];
  shaders.push(shader);
  store.set('shaders', shaders);
  return store;
}
