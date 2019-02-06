/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Color from '../basis/Color';
import Texture from '../textures/Texture';
import Material from './Material';

interface PointsOptions {
  color?: Color;
  map?: Texture;
  size?: number;
  sizeAttenuation?: boolean;
  morphTargets?: boolean;
  lights?: boolean;
};

export default class Points extends Material {

  color = new Color(0xffffff);

  map: Texture;

  size = 1;
  sizeAttenuation = true;

  morphTargets = false;

  lights = false;

  constructor(options: PointsOptions) {
    super(options);
    (Object as any).assign(this, options);
  }

  clone() {
    return new Points({...this});
  }

  toJSON() {
    throw new Error('Not implemented');
  }
}
