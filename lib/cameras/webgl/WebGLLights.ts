import Camera from "../Camera";
import Light from "../../objects/Light";

/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

export class LightUniformsCache {

  private lights: { [id: number]: any };

  get(light: Light) {

    if (this.lights[light.transform.id] !== undefined) {
      return this.lights[light.transform.id];
    }

    const uniforms = light.generateUniform();

    this.lights[light.transform.id] = uniforms;

    return uniforms;

  }
}

let count = 0;

export default class WebGLLights {

  private cache = new LightUniformsCache();

  state = {

    id: count++,

    hash: {
      stateID: -1,
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      shadowsLength: -1
    },

    ambient: [0, 0, 0],
    directional: new Array(),
    spot: new Array(),
    rectArea: new Array(),
    point: new Array(),
    hemi: new Array()

  };

  setup(lights: Light[], shadows: Light[], camera: Camera) {
    const state = this.state;

    state.ambient = [];

    state.directional = [];
    state.spot = [];
    state.rectArea = [];
    state.point = [];
    state.hemi = [];

    let viewMatrix = camera.matrixWorldInverse;

    lights.forEach(e => e.shine(this.state, this.cache, viewMatrix));

    state.hash.stateID = state.id;
    state.hash.directionalLength = state.directional.length;
    state.hash.pointLength = state.point.length;
    state.hash.spotLength = state.spot.length;
    state.hash.rectAreaLength = state.rectArea.length;
    state.hash.hemiLength = state.hemi.length;
    state.hash.shadowsLength = shadows.length;
  }
}
