/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import EventSource from '../basis/EventSource';
import Transform from '../basis/Transform';
import Material from '../materials/Material';
import Color from '../basis/Color';
import Texture from '../textures/Texture';
import WebGLRenderTarget from '../cameras/webgl/WebGLRenderTarget';

export default class Scene extends EventSource {
  transform: Transform;
  name = '';
  overrideMaterial?: Material;
  background?: Color | Texture | WebGLRenderTarget;

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}

export class Fog {
  name = '';

  color: Color;

  constructor(color: number, public near = 1, public far = 1000) {
    this.color = new Color(color);
  }
}
