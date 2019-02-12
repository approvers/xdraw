/**
 * @author abelnation / http://github.com/abelnation
 * @author RkEclair / https://github.com/RkEclair
 */

import Light from "../Light";
import Color from "../../basis/Color";
import Vector3 from "../../basis/Vector3";
import Vector2 from "../../basis/Vector2";
import WebGLLights, { LightUniformsCache } from "../../cameras/webgl/WebGLLights";
import Matrix4 from "../../basis/Matrix4";

export default class RectAreaLight extends Light {
  constructor(color: Color, intensity: number, public width = 10, public height = 10) {
    super(color, intensity);
  }

	generateUniform() {
		return {
			color: new Color(),
			position: new Vector3(),
			halfWidth: new Vector3(),
			halfHeight: new Vector3(),

			shadow: false,
			shadowBias: 0,
			shadowRadius: 1,
			shadowMapSize: new Vector2(),
			shadowCameraNear: 1,
			shadowCameraFar: 1000
		};
	}

	shine(state: WebGLLights, cache: LightUniformsCache, viewMatrix: Matrix4) {
		const uniforms = cache.get(this);

		// (a) intensity is the total visible this emitted
		//uniforms.color.copy( color ).multiplyScalar( intensity / ( this.width * this.height * Math.PI ) );

		// (b) intensity is the brightness of the this
		uniforms.color = this.color.clone().multiplyScalar(this.intensity);

		uniforms.position.setFromMatrixPosition(this.transform.matrixWorld);
		uniforms.position.applyMatrix4(viewMatrix);

		// extract local rotation of this to derive width/height half vectors
		let matrix42 = Matrix4.identity();
		let matrix4 = this.transform.matrixWorld.clone();
		matrix4 = viewMatrix.multiply(matrix4);
		matrix42 = Matrix4.extractRotation(matrix4);

		uniforms.halfWidth.set(this.width * 0.5, 0.0, 0.0);
		uniforms.halfHeight.set(0.0, this.height * 0.5, 0.0);

		uniforms.halfWidth.applyMatrix4(matrix42);
		uniforms.halfHeight.applyMatrix4(matrix42);

		// TODO (abelnation): RectAreaLight distance?
		// uniforms.distance = distance;

		state.rectArea.push(uniforms);
	}
}
