import Color from '../../basis/Color';
import {XBind} from '../../basis/Components';

import MaterialBase, {ColorUniform} from './MaterialUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

const Unlit = (color = new Color(Math.random() * 0xffffff)) => MaterialBase(
    () => {}, {color: new XBind(color)}, {color: ColorUniform},
    (gl, drawCall) => {
      drawCall(gl.TRIANGLE_STRIP);
    });

export default Unlit;
