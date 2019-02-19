import Color from '../../basis/Color';
import {XStore} from '../../basis/Components';

import MaterialBase from './MaterialUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

const Points = (color = new Color(Math.random() * 0xffffff)) => MaterialBase(
    (store: XStore) => {
      if (!store.hasBind('material.color')) {
        store.addBind('material.color', color);
      }
      return store;
    },
    {color: new Float32Array([color.r, color.g, color.b])},
    (gl, drawCall) => {
      drawCall(gl.POINTS);
    });

export default Points;
