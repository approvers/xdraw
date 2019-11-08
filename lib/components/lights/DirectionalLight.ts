import Color from '../../basis/Color';
import {Component} from '../../basis/Components';

import {packLight} from './LightUtils';

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

type DirectLightProps = {
  intensity: number,
  color: Color,
};

const clampers = {
  intensity: (v: number) => Math.max(v, 0),
};

export default class DirectionalLight implements Component<DirectLightProps> {
  defaultProps: DirectLightProps;
  constructor(intensity = 1, color = new Color(0xffffff)) {
    this.defaultProps = {intensity, color};
    packLight(this);
  }

  update = [];
}
