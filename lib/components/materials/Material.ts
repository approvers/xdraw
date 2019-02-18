import {XStore} from '../../basis/Components';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

export interface Shader {
  uniforms: {[locationName: string]: Float32Array|Int32Array;};
  vertexShader: string;
  fragmentShader: string;
}

export function packMaterial(store: XStore, shader: Shader) {
  const shaders = (store.get('shaders') || []) as Shader[];
  shaders.push(shader);
  store.set('shaders', shaders);
  return store;
}
