/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Euler from './Euler';
import EventSource from './EventSource';
import Matrix4 from './Matrix4';
import Quaternion from './Quaternion';
import Sphere from './Sphere';
import Vector3 from './Vector3';
import Matrix3 from './Matrix3';

let globalId = 0;

export class XObject {
  [key: string]: any;
  transform: Transform;
  recieveShadow: true;
}

export default class Transform extends EventSource {
  static DefaultUp = () => new Vector3(0, 1, 0);

  id: number;
  name: string;
  parent: Transform | null;
  children: Transform[];

  position: Vector3;
  rotation: Euler;
  quaternion: Quaternion;
  scale = new Vector3(1, 1, 1);
  visible = true;

  matrix = new Matrix4();
  matrixWorld = new Matrix4();
  modelViewMatrix = new Matrix4();
  normalMatrix = new Matrix3();
  matrixAutoUpdate = true;
  matrixWorldNeedsUpdate = true;

  renderOrder: number = 0;

  // lazy boundings
  boundingSphere: Sphere | null;

  constructor(public object: XObject) {
    super();
    this.id = globalId++;
    this.name = '';
    this.parent = null;
    this.children = [];
  }

  computeBoundingSphere(vertices: Vector3[]) {
    return this.boundingSphere = Sphere.fromPoints(vertices);
  }

  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale);

    this.matrixWorldNeedsUpdate = true;
  }

  updateMatrixWorld(force = false) {
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

  private traversed: Transform[];

  private traverseRecursive(func: (transform: Transform) => void) {
    if (this.traversed.some(e => e === this)) return;
    this.traversed.push(this);
    this.children.forEach(e => {
      func(e);
      e.traverseRecursive(func);
    });
  }

  traverse(func: (transform: Transform) => void) {
    this.traversed = [];
    this.children.forEach(e => {
      func(e);
      e.traverseRecursive(func);
    });
  }
}
