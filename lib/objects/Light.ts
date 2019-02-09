/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import Transform from "../basis/Transform";
import Color from "../basis/Color";
import Vector2 from "../basis/Vector2";
import Matrix4 from "../basis/Matrix4";
import Camera from "../cameras/Camera";
import { LightUniformsCache } from "../cameras/webgl/WebGLLights";

export class LightShadow {
  constructor(public camera: Camera) { }

  bias = 0;
  radius = 1;
  mapSize = new Vector2(512, 512);
  map: {[key: string]: any};
  matrix = new Matrix4();

  clone() {
    const newL = new LightShadow(this.camera);
    newL.bias = this.bias;
    newL.radius = this.radius;
    newL.mapSize = this.mapSize.clone();
    return newL;
  }
}

export default class Light {
  transform: Transform;
	castShadow = true;
  recieveShadow = true;
  shadow: LightShadow;

  constructor(public color: Color, public intensity: number = 1) { }

	clone() {
		const newL = new Light(this.color, this.intensity);
		newL.castShadow = this.castShadow;
	  newL.recieveShadow = this.recieveShadow;
		return newL;
	}

  generateUniform() {
    return {};
  }

  shine(_state: any, _cache: LightUniformsCache, _viewMatrix: Matrix4) { // like render
    throw new Error('This funciton is for override');
  }
}
