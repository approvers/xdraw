import Color from '../../basis/Color';
import {XStore} from '../../basis/Components';
import {packMaterial, ShaderSet} from './Material';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

const Unlit = ({color = new Color(Math.random() * 0xffffff), shaders}:
                   {color?: Color; shaders?: ShaderSet}) => (store: XStore) => {
  packMaterial(store, {
    uniforms: {diffuse: new Float32Array([color.r, color.g, color.b])},
    shaders
  });
  return store;
};

export default Unlit;
