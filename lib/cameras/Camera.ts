/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Matrix4 from '../basis/Matrix4';
import Transform from '../basis/Transform';
import Vector3 from '../basis/Vector3';

import Renderer from './Renderer';

export default class Camera {
  private renderer: Renderer;

  transform: Transform;
  matrixWorld = new Matrix4();
  matrixWorldInverse = new Matrix4();
  projectionMatrix = new Matrix4();

  get worldDirection() {
    this.updateMatrixWorld(true);
    const e = this.matrixWorld.elements;
    return new Vector3(-e[8], -e[9], -e[10]).normalize();
  }

  get canvas() { return this.renderer.domElement; }

  updateMatrixWorld(force: boolean) {
    this.transform.updateMatrixWorld(force);
    this.matrixWorldInverse.inverse(this.matrixWorld);
  }
}

export class OrthoCamera extends Camera {
  zoom = 1;
  view : null | {
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
