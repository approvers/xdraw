/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Matrix4 from '../basis/Matrix4';
import Transform from '../basis/Transform';
import Vector3 from '../basis/Vector3';

import Renderer from './Renderer';

export default class Camera {
  transform: Transform;
  matrixWorld = new Matrix4();
  matrixWorldInverse = new Matrix4();
  projectionMatrix = new Matrix4();

  get worldDirection() {
    this.updateMatrixWorld(true);
    const e = this.matrixWorld.elements;
    return new Vector3(-e[8], -e[9], -e[10]).normalize();
  }

  updateMatrixWorld(force: boolean) {
    this.transform.updateMatrixWorld(force);
    this.matrixWorldInverse.inverse(this.matrixWorld);
  }
}

export class OrthoCamera extends Camera {
  renderer: Renderer;
  render() {}
}
