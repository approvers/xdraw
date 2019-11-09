/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from '../basis/Color';

import Model from './Model';
import Renderer from './renderer/Renderer';


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
  private _models: Model[] = [];
  private _others: any[] = [];
  private _renderer?: Renderer;

  addModel(model: Model) {
    this._models.push(model);
  }

  addAnother(other: any) {
    this._others.push(other);
  }

  get models() {
    return this._models;
  }
}
