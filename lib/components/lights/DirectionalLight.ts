import Color from '../../basis/Color';
import {XBind, XComponent} from '../../basis/Components';

import {packLight} from './LightUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class DirectionalLight implements XComponent {
  binds;
  constructor(intensity = 1, color = new Color(0xffffff)) {
    this.binds = {
      intensity: new XBind(intensity, (v) => Math.max(v, 0)),
      color: new XBind(color)
    };
    packLight(this);
  }

  update = [];
}
