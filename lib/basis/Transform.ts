/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Euler from './Euler';
import EventSource from './EventSource';
import Matrix4 from './Matrix4';
import Quaternion from './Quaternion';
import Sphere from './Sphere';
import Vector3 from './Vector3';

let globalId = 0;

export default class Transform extends EventSource {
  id: number;
  name: string;
  parent: Transform;
  children: Transform[];

  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  scale = new Vector3(1, 1, 1);

  vertices: Vector3[] = [];

  matrix = new Matrix4();
  matrixWorld = new Matrix4();
  matrixAutoUpdate = true;
  matrixWorldNeedsUpdate = true;

  // lazy boundings
  boundingSphere = null;

  constructor() {
    super();
    this.id = globalId++;
    this.name = '';
    this.parent = null;
    this.children = [];
  }

  computeBoundingSphere() {
    this.boundingSphere = Sphere.fromPoints(this.vertices);
  }

  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);

    this.matrixWorldNeedsUpdate = true;
  }

  updateMatrixWorld(force: boolean) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.matrixWorldNeedsUpdate || force) {
      if (this.parent === null) {
        this.matrixWorld = this.matrix.clone();
      } else {
        this.matrixWorld =
            this.parent.matrixWorld.clone().multiply(this.matrix);
      }
      this.matrixWorldNeedsUpdate = false;
      force = true;
    }

    this.children.forEach((e) => e.updateMatrixWorld(force));
  }
}
