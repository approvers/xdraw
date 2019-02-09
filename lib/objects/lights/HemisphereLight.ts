/**
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Light from "../Light";
import Color from "../../basis/Color";
import Transform from "../../basis/Transform";
import Vector3 from "../../basis/Vector3";
import Matrix4 from "../../basis/Matrix4";
import { LightUniformsCache } from "../../cameras/webgl/WebGLLights";

export default class HemisphereLight extends Light {
  constructor(skyColor: Color, public groundColor: Color, intensity: number) {
    super(skyColor, intensity);

    this.transform.position = Transform.DefaultUp();
    this.transform.updateMatrix();
  }

	generateUniform() {
		return {
			direction: new Vector3(),
			skyColor: new Color(),
			groundColor: new Color()
		};
	}

	shine(state: {[key: string]: any, hemi: {
    uniforms: any
  }[]}, cache: LightUniformsCache, viewMatrix: Matrix4) {
		const uniforms = cache.get(this);

		uniforms.direction.setFromMatrixPosition(this.transform.matrixWorld);
		uniforms.direction.transformDirection(viewMatrix);
		uniforms.direction.normalize();

		uniforms.skyColor = this.color.clone().multiplyScalar(this.intensity);
		uniforms.groundColor = this.groundColor.clone().multiplyScalar(this.intensity);

		state.hemi.push(uniforms);
	}
}
