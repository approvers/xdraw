import Color from '../basis/Color';
import Transform from '../basis/Transform';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export const Scene =
    () => {
      const root = new Transform;
      root.name = 'SceneRoot';
      const body = new Transform;
      root.add(body);
      return body;
    }

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
