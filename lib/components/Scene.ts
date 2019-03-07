import Color from '../basis/Color';
/**
 * @author RkEclair / https://github.com/RkEclair
 */

export class Fog {
  name = '';

  color: Color;

  constructor(color: number, public near = 1, public far = 1000) {
    this.color = new Color(color);
  }
}

export class FogExp2 extends Fog {
  constructor(color: number, public density: number) {
    super(color);
  }
}
