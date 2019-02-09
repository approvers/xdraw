/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Light, { LightShadow } from "../Light";
import { OrthoCamera } from "../../cameras/Camera";
import Transform from "../../basis/Transform";
import Color from "../../basis/Color";
import Vector3 from "../../basis/Vector3";
import Vector2 from "../../basis/Vector2";
import { LightUniformsCache } from "../../cameras/webgl/WebGLLights";
import Matrix4 from "../../basis/Matrix4";
import Texture from "../../textures/Texture";


export class DirectionalLightShadow extends LightShadow {
  constructor() {
    super(new OrthoCamera(- 5, 5, 5, - 5, 0.5, 500));
  }
}


export default class DirectionalLight extends Light {
  target: Transform;
  shadow = new DirectionalLightShadow();

  constructor(color: Color, intensity: number) {
    super(color, intensity);

    this.transform.position = Transform.DefaultUp();
    this.transform.updateMatrix();
  }

  clone() {
    const newL = super.clone() as DirectionalLight;

    newL.target = this.target.object.clone().transform;

    newL.shadow = this.shadow.clone();

    return newL;
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

  shine(state: {[key: string]: any, directional: {
    uniforms: any,
    texture: Texture,
    matrix: Matrix4
  }[]}, cache: LightUniformsCache, viewMatrix: Matrix4) {
    const uniforms = cache.get(this);

    uniforms.color.copy(this.color).multiplyScalar(this.intensity);
    uniforms.direction.setFromMatrixPosition(this.transform.matrixWorld);
    const vec = Vector3.fromMatrixPosition(this.target.matrixWorld);
    uniforms.direction.sub(vec);
    uniforms.direction.transformDirection(viewMatrix);

    uniforms.shadow = this.castShadow;

    if (this.castShadow) {

      const shadow = this.shadow;

      uniforms.shadowBias = shadow.bias;
      uniforms.shadowRadius = shadow.radius;
      uniforms.shadowMapSize = shadow.mapSize;

    }

    state.directional.push({
      uniforms,
      texture: this.shadow.map.texture,
      matrix: this.shadow.matrix
    });
  }
}
