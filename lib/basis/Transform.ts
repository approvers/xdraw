/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Components from './Components';
import Euler from './Euler';
import EventSource from './EventSource';
import Matrix3 from './Matrix3';
import Matrix4 from './Matrix4';
import Quaternion from './Quaternion';
import Sphere from './Sphere';
import Vector3 from './Vector3';

let globalId = 0;

export default class Transform extends EventSource {
  id: number;
  name: string;
  parent: Transform|null = null;
  children: Transform[] = [];

  position = new Vector3();
  rotation = new Euler();
  quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);
  visible = true;
  recieveRaycast = true;

  matrix = new Matrix4();
  matrixWorld = new Matrix4();
  matrixWorldInverse = new Matrix4();
  modelViewMatrix = new Matrix4();
  projectionMatrix = new Matrix4();
  projectionMatrixInverse = new Matrix4();
  normalMatrix = new Matrix3();
  matrixAutoUpdate = true;
  matrixWorldNeedsUpdate = true;

  renderOrder: number = 0;

  castShadow: true;
  recieveShadow: true;

  // lazy boundings
  boundingSphere: Sphere|null;

  constructor(public readonly comps = new Components()) {
    super();
    this.id = globalId++;
    this.name = `${this.id}`;
  }

  add(newChild: Transform) {
    this.children.push(newChild);
    newChild.parent = this;
  }

  update() {
    this.comps.process(this);
    this.updateMatrix();
  }

  static get up() {
    return new Vector3(0, 1, 0);
  }
  static get down() {
    return new Vector3(0, -1, 0);
  }
  static get back() {
    return new Vector3(0, 0, -1);
  }
  static get front() {
    return new Vector3(0, 0, 1);
  }
  static get left() {
    return new Vector3(-1, 0, 0);
  }
  static get right() {
    return new Vector3(1, 0, 0);
  }

  clone() {
    const newT = new Transform(this.comps.clone());
    newT.id = this.id;
    newT.name = this.name;
    newT.parent = this.parent;

    newT.position = this.position.clone();
    newT.rotation = this.rotation.clone();
    newT.quaternion = this.quaternion.clone();
    newT.scale = this.scale.clone();
    newT.visible = this.visible;
    newT.recieveRaycast = this.recieveRaycast;

    newT.matrix = this.matrix.clone();
    newT.matrixWorld = this.matrixWorld.clone();
    newT.matrixWorldInverse = this.matrixWorldInverse.clone();
    newT.modelViewMatrix = this.modelViewMatrix.clone();
    newT.projectionMatrix = this.projectionMatrix.clone();
    newT.projectionMatrixInverse = this.projectionMatrixInverse.clone();
    newT.normalMatrix = this.normalMatrix.clone();
    newT.matrixAutoUpdate = this.matrixAutoUpdate;

    newT.renderOrder = this.renderOrder;

    newT.castShadow = this.castShadow;
    newT.recieveShadow = this.recieveShadow;

    newT.boundingSphere = this.boundingSphere;
    return newT;
  }

  computeBoundingSphere(vertices: Vector3[]) {
    return this.boundingSphere = Sphere.fromPoints(vertices);
  }

  updateMatrix() {
    this.matrix = Matrix4.compose(this.position, this.quaternion, this.scale);

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

  updateWorldMatrix(updateParents: boolean, updateChildren: boolean) {
    const parent = this.parent;
    if (updateParents === true && parent !== null) {
      parent.updateWorldMatrix(true, false);
    }

    if (this.matrixAutoUpdate) this.updateMatrix();
    if (this.parent === null) {
      this.matrixWorld = this.matrix.clone();
    } else {
      this.matrixWorld = this.parent.matrixWorld.clone().multiply(this.matrix);
    }

    // update children
    if (updateChildren === true) {
      this.children.forEach(e => e.updateWorldMatrix(false, true));
    }
  }

  lookAt(target: Vector3) {  // This method does not support objects having
                             // non-uniformly-scaled parent(s)
    this.updateWorldMatrix(true, false);

    const position = Vector3.fromMatrixPosition(this.matrixWorld);

    this.quaternion = Quaternion.fromRotationMatrix(
        Matrix4.lookAt(target, position, Transform.up));

    if (this.parent) {
      const m1 = Matrix4.extractRotation(this.parent.matrixWorld);
      const q1 = Quaternion.fromRotationMatrix(m1);
      this.quaternion.premultiply(q1.inverse());
    }
  }

  private traverseRecursive(
      func: (transform: Transform) => void, traversed: Transform[]) {
    if (traversed.some(e => e === this)) return;
    traversed.push(this);
    this.children.forEach(e => {
      func(e);
      e.traverseRecursive(func, traversed);
    });
  }

  traverse(func: (transform: Transform) => void) {
    const traversed: Transform[] = [];
    this.children.forEach(e => {
      func(e);
      e.traverseRecursive(func, traversed);
    });
  }
}
