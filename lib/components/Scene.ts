import Color from '../basis/Color';
import Renderer from './renderer/Renderer';
/**
 * @author MikuroXina / https://github.com/MikuroXina
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

export class Scene {
  private _objs: any[] = [];
  private _renderer?: Renderer;

  add(v: any) {
    this._objs.push(v);
  }

  get objs() {
    return this._objs;
  }
}
