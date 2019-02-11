/**
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Light, { LightShadow } from "../Light";
import Transform from "../../basis/Transform";
import Color from "../../basis/Color";
import Vector3 from "../../basis/Vector3";
import Vector2 from "../../basis/Vector2";
import WebGLLights, { LightUniformsCache } from "../../cameras/webgl/WebGLLights";
import Matrix4 from "../../basis/Matrix4";
import { PersCamera } from "../../cameras/Camera";

export class SpotLightShadow extends LightShadow {
	constructor() {
		super(new PersCamera( 50, 1, 0.5, 500 ));
	}
}

export default class SpotLight extends Light {
  target: Transform;
	shadow = new SpotLightShadow();

  constructor(color: Color, intensity: number,
		public distance = 0,
		public angle = Math.PI / 3,
		public penumbra = 0,
		public decay = 1
	) {
    super(color, intensity);

    this.transform.position = Transform.DefaultUp();
    this.transform.updateMatrix();
  }

	get power() {
		return this.intensity * Math.PI;
	}

	set power(p: number) {
		this.intensity = p / Math.PI;
	}

  generateUniform() {
    return {
			position: new Vector3(),
			direction: new Vector3(),
			color: new Color(),
			distance: 0,
			coneCos: 0,
			penumbraCos: 0,
			decay: 0,

			shadow: false,
			shadowBias: 0,
			shadowRadius: 1,
			shadowMapSize: new Vector2()
		};
  }

  shine(state: WebGLLights, cache: LightUniformsCache, viewMatrix: Matrix4) {
		const uniforms = cache.get(this);

		uniforms.position.setFromMatrixPosition(this.transform.matrixWorld);
		uniforms.position.applyMatrix4(viewMatrix);

		uniforms.color = this.color.clone().multiplyScalar(this.intensity);
		uniforms.distance = this.distance;

		uniforms.direction.setFromMatrixPosition(this.transform.matrixWorld);
		const vec = Vector3.fromMatrixPosition(this.target.matrixWorld);
		uniforms.direction.sub(vec);
		uniforms.direction.transformDirection(viewMatrix);

		uniforms.coneCos = Math.cos(this.angle);
		uniforms.penumbraCos = Math.cos(this.angle * (1 - this.penumbra));
		uniforms.decay = this.decay;

		uniforms.shadow = this.castShadow;

		if (this.castShadow) {

			const shadow = this.shadow;

			uniforms.shadowBias = shadow.bias;
			uniforms.shadowRadius = shadow.radius;
			uniforms.shadowMapSize = shadow.mapSize;

		}

		state.spot.push({
      uniforms,
      texture: this.shadow.map.texture,
      matrix: this.shadow.matrix
    });
  }
}
