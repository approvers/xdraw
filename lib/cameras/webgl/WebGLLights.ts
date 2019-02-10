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

  private id = count++;

  hash = {
    stateID: -1,
    directionalLength: -1,
    pointLength: -1,
    spotLength: -1,
    rectAreaLength: -1,
    hemiLength: -1,
    shadowsLength: -1
  };

  private ambient = [0, 0, 0];
  private directional = new Array();
  private spot = new Array();
  private rectArea = new Array();
  private point = new Array();
  private hemi = new Array();

  setup(lights: Light[], shadows: Light[], camera: Camera) {
    this.ambient = [];

    this.directional = [];
    this.spot = [];
    this.rectArea = [];
    this.point = [];
    this.hemi = [];

    let viewMatrix = camera.matrixWorldInverse;

    lights.forEach(e => e.shine(this, this.cache, viewMatrix));

    this.hash.thisID = this.id;
    this.hash.directionalLength = this.directional.length;
    this.hash.pointLength = this.point.length;
    this.hash.spotLength = this.spot.length;
    this.hash.rectAreaLength = this.rectArea.length;
    this.hash.hemiLength = this.hemi.length;
    this.hash.shadowsLength = shadows.length;
  }
}
