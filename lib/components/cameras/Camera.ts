/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 * @author RkEclair / https://github.com/RkEclair
 */

import Transform, { XObject } from '../basis/Transform';
import Vector3 from '../basis/Vector3';
import Renderer from './Renderer';

export default class Camera  {
  renderer?: Renderer;

  transform: Transform = new Transform(this);

  get worldDirection() {
    this.updateMatrixWorld(true);
    const e = this.transform.matrixWorld.elements;
    return new Vector3(-e[8], -e[9], -e[10]).normalize();
  }

  get canvas() { return this.renderer === undefined ? null : this.renderer.domElement; }

  updateMatrixWorld(force: boolean) {
    this.transform.updateMatrixWorld(force);
    this.transform.matrixWorldInverse.inverse(this.transform.matrixWorld);
  }
}

export class OrthoCamera extends Camera {
  zoom = 1;
  view?: {
    enabled: boolean;
    fullWidth: number;
    fullHeight: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };

  constructor(
    public left = - 1,
    public right = 1,
    public top = 1,
    public bottom = - 1,
    public near = 0.1,
    public far = 2000
  ) {
    super();
  }

  clone() {
    const newC = new OrthoCamera(this.left, this.right, this.top, this.bottom, this.near, this.far);
    newC.zoom = this.zoom;
    newC.view = this.view;
    return newC;
  }

  render() {

  }
}

export class PersCamera extends Camera {
  view?: {
    enabled: boolean;
    fullWidth: number;
    fullHeight: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
  };

  constructor(
    public fov = 50,
    public zoom = 1,
    public near = 0.01,
    public far = 2000,
    public focus = 10,
    public aspect = 1,
    public filmGauge = 35,	// width of the film (default in millimeters)
    public filmOffset = 0) {
    super();
    this.updateProjectionMatrix();
  }

  getFilmWidth() {

    // film not completely covered in portrait format (aspect < 1)
    return this.filmGauge * Math.min(this.aspect, 1);

  }

  getFilmHeight() {

    // film not completely covered in landscape format (aspect > 1)
    return this.filmGauge / Math.max(this.aspect, 1);

  }

  updateProjectionMatrix() {

    const near = this.near,
      view = this.view;
    let top = near * Math.tan(Math.PI / 180 * 0.5 * this.fov) / this.zoom,
      height = 2 * top,
      width = this.aspect * height,
      left = - 0.5 * width;

    if (view !== undefined && view.enabled) {

      var fullWidth = view.fullWidth,
        fullHeight = view.fullHeight;

      left += view.offsetX * width / fullWidth;
      top -= view.offsetY * height / fullHeight;
      width *= view.width / fullWidth;
      height *= view.height / fullHeight;

    }

    var skew = this.filmOffset;
    if (skew !== 0) left += near * skew / this.getFilmWidth();

    this.transform.projectionMatrix.makePerspective(left, left + width, top, top - height, near, this.far);

    this.transform.projectionMatrixInverse.inverse(this.transform.projectionMatrix);

  }
}
