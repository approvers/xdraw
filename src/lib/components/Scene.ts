/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from "../basis/Color";

import Camera from "./cameras/Camera";
import Light from "./lights/Light";
import Model from "./Model";
import MeshRenderer from "./renderer/MeshRenderer";
import Renderer from "./renderer/Renderer";
import WebGLClears from "./renderer/webgl/WebGLClears";
import Transform from "./Transform";

export class Fog {
  name = "";

  color: Color;

  constructor(color: number, public near = 1, public far = 1000) {
    this.color = new Color(color);
  }
}

export class FogExp2 extends Fog {
  constructor(color: number, public density: number) {
    super(color);
  }
}

export class Scene {
  private _root = new Transform();

  private _models: Model[] = [];

  private _lights: Light[] = [];

  private _cameras: Camera[] = [];

  private _others: any[] = [];

  private _renderer: Renderer;

  constructor(
    canvas: HTMLCanvasElement,
    width: number,
    height: number,
    backgroundSetter: (clears: WebGLClears) => void = () => {},
  ) {
    this._renderer = new MeshRenderer(
      this,
      canvas,
      width,
      height,
      backgroundSetter,
    );
  }

  addModel(model: Model) {
    this._root.add(model.transform);
    this._models.push(model);
  }

  addLight(light: Light) {
    this._root.add(light.transform);
    this._lights.push(light);
  }

  addCamera(camera: Camera) {
    this._root.add(camera.transform);
    this._cameras.push(camera);
  }

  addAnother(other: any) {
    this._others.push(other);
  }

  update() {
    for (const model of this.models) {
      model.mesh.run();
      model.mat.run();
    }
    for (const camera of this.cameras) {
      camera.run();
    }
    this._renderer.run();
  }

  get models() {
    return this._models;
  }

  get lights() {
    return this._lights;
  }

  get cameras() {
    return this._cameras;
  }
}
