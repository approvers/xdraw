import Color from '../../basis/Color';
import {XStore} from '../../basis/Components';

import MaterialBase, { ColorUniform } from './MaterialUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

const Unlit = (color = new Color(Math.random() * 0xffffff)) => MaterialBase(
    (store: XStore) => {
      if (!store.hasBind('material.color')) {
        store.addBind('material.color', color);
      }
      return store;
    },
    {color: ColorUniform},
    (gl, drawCall) => {
      drawCall(gl.TRIANGLE_STRIP);
    });

export default Unlit;
