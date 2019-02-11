/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Light from "../Light";
import Transform from "../../basis/Transform";
import Color from "../../basis/Color";
import Vector3 from "../../basis/Vector3";
import Vector2 from "../../basis/Vector2";
import Matrix4 from "../../basis/Matrix4";
import WebGLLights, { LightUniformsCache } from "../../cameras/webgl/WebGLLights";


export default class AmbientLight extends Light {
  target: Transform;

  constructor(color: Color, intensity: number) {
    super(color, intensity);

    this.transform.position = Transform.DefaultUp();
    this.transform.updateMatrix();
  }

  generateUniform() {
    return {
      direction: new Vector3(),
      color: new Color(),

      shadow: false,
      shadowBias: 0,
      shadowRadius: 1,
      shadowMapSize: new Vector2()
    };
  }

	shine(state: WebGLLights, _cache: LightUniformsCache, _viewMatrix: Matrix4) {
		const ambient = state.ambient;
		ambient[0] += this.color.r * this.intensity;
		ambient[1] += this.color.g * this.intensity;
		ambient[2] += this.color.b * this.intensity;
	}
}
