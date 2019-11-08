/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from '../../basis/Color';
import Light from './Light';

export default class DirectionalLight extends Light {
  constructor() {
    super({
      intensity: {initValue: 1, clamper: (v: number) => Math.max(v, 0)},
      color: {initValue: new Color(0xffffff)}
    });
  }
}
