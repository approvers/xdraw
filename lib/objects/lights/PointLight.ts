/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Light, { LightShadow } from "../Light";
import { PersCamera } from "../../cameras/Camera";
import Color from "../../basis/Color";
import { LightUniformsCache } from "../../cameras/webgl/WebGLLights";
import Texture from "../../textures/Texture";
import Matrix4 from "../../basis/Matrix4";
import Vector3 from "../../basis/Vector3";
import Vector2 from "../../basis/Vector2";

export class PointLightShadow extends LightShadow {
	constructor() {
		super(new PersCamera(90, 1, 0.5, 500))
	}
}

export default class PointLight extends Light {
  shadow = new PointLightShadow();

  constructor(color: Color, intensity: number, public distance: number = 0, public decay: number = 1) {
    super(color, intensity);
  }

  get power() {
    // intensity = power per solid angle.
    // ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
    return this.intensity * 4 * Math.PI;
  }

  set power(p: number) {
    // intensity = power per solid angle.
    // ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
    this.intensity = p / (4 * Math.PI);
  }

	generateUniform() {
		return {
			position: new Vector3(),
			color: new Color(),
			distance: 0,
			decay: 0,

			shadow: false,
			shadowBias: 0,
			shadowRadius: 1,
			shadowMapSize: new Vector2(),
			shadowCameraNear: 1,
			shadowCameraFar: 1000
		};
	}

  shine(state: {[key: string]: any, point: {
    uniforms: any,
    texture: Texture,
    matrix: Matrix4
  }[]}, cache: LightUniformsCache, viewMatrix: Matrix4) {
    const uniforms = cache.get(this);

    uniforms.position.setFromMatrixPosition(this.transform.matrixWorld);
    uniforms.position.applyMatrix4(viewMatrix);

    uniforms.color = this.color.clone().multiplyScalar(this.intensity);
    uniforms.distance = this.distance;
    uniforms.decay = this.decay;

    uniforms.shadow = this.castShadow;

    if (this.castShadow) {

      const shadow = this.shadow, camera = shadow.camera as PersCamera;

      uniforms.shadowBias = shadow.bias;
      uniforms.shadowRadius = shadow.radius;
      uniforms.shadowMapSize = shadow.mapSize;
      uniforms.shadowCameraNear = camera.near;
      uniforms.shadowCameraFar = camera.far;

    }

		state.point.push({
      uniforms,
      texture: this.shadow.map.texture,
      matrix: this.shadow.matrix
    });
  }
}
