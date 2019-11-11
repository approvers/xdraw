/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from '../../basis/Color';
import Transform from '../Transform';
import Light from './Light';

export default class DirectionalLight extends Light {
  constructor({color = new Color(0xffffff), intensity = 1}) {
    super({
      intensity: {initValue: intensity, clamper: (v: number) => Math.max(v, 0)},
      color: {initValue: color}
    });
  }

  intensity(_illuminated: Transform) {
    const intensity = this.store.addProp('intensity', 1);
    return intensity;
  }
}
