/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Components, {XComponent, XStore} from './Components';
import Euler from './Euler';
import EventSource from './EventSource';
import Matrix4 from './Matrix4';
import Quaternion from './Quaternion';
import Sphere from './Sphere';
import Vector3 from './Vector3';

let globalId = 0;

export default class Transform {
  id: number;
  name: string;
  parent: Transform|null = null;
  children: Transform[] = [];
  get root() {
    let root: Transform = this;
    while (root.parent) root = root.parent;
    return root;
  }

  position = new Vector3();
  quaternion = new Quaternion();
  scale = new Vector3(1, 1, 1);
  visible = true;
  recieveRaycast = true;
  static = false;

  matrix = new Matrix4();
  matrixWorld = new Matrix4();
  matrixAutoUpdate = true;
  matrixWorldNeedsUpdate = true;

  renderOrder: number = 0;

  castShadow = true;
  recieveShadow = true;

  // lazy boundings
  boundingSphere: Sphere|null = null;

  store: XStore = new XStore;

  readonly willUpdate = new EventSource<Transform>();
  readonly didUpdate = new EventSource<Transform>();
  readonly willUpdateMatrix = new EventSource<Transform>();
  readonly didUpdateMatrix = new EventSource<Transform>();
  readonly awake = new EventSource<Transform>();
  readonly start = new EventSource<Transform>();
  readonly dispose = new EventSource<Transform>();

  constructor(private comps = new Components()) {
    this.id = globalId++;
    this.name = `${this.id}`;
  }

  add(newChild: Transform) {
    this.children.push(newChild);
    newChild.parent = this;
  }

  addComponent(component: XComponent) {
    return this.comps.add(component, this, this.store);
  }

  flush() {}

  private update() {
    this.willUpdate.dispatchEvent(this);
    this.comps.update();
    this.didUpdate.dispatchEvent(this);
  }

  static newScene() {
    const root = new Transform;
    root.name = 'SceneRoot';
    root.flush = () => {
      root.traverse((t) => {
        t.update();
        t.updateMatrix();
      }, (t) => (t.name !== root.name) && t.updateMatrixWorld());
    };
    return root;
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
    newT.quaternion = this.quaternion.clone();
    newT.scale = this.scale.clone();
    newT.visible = this.visible;
    newT.recieveRaycast = this.recieveRaycast;

    newT.matrix = this.matrix.clone();
    newT.matrixWorld = this.matrixWorld.clone();
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

  private updateMatrix() {
    this.willUpdateMatrix.dispatchEvent(this);
    this.matrix = Matrix4.compose(this.position, this.quaternion, this.scale);

    this.matrixWorldNeedsUpdate = true;
    this.didUpdateMatrix.dispatchEvent(this);
  }

  private updateMatrixWorld(force = false) {
    if (this.matrixAutoUpdate) this.updateMatrix();

    if (this.matrixWorldNeedsUpdate || force) {
      if (this.parent === null) {
        this.matrixWorld = this.matrix.clone();
      } else {
        this.parent.updateMatrixWorld();
        this.matrixWorld = this.parent.matrixWorld.multiply(this.matrix);
      }
      this.matrixWorldNeedsUpdate = false;
    }
  }

  translate(amount: Vector3) {
    this.position = this.position.add(amount);
  }

  rotate(amount: Euler) {
    const v = Euler.fromQuaternion(this.quaternion, amount.order);
    this.quaternion = Quaternion.fromEuler(v.add(amount));
  }

  lookAt(target: Vector3) {  // This method does not support objects having
                             // non-uniformly-scaled parent(s)
    this.updateMatrix();

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
      traversed: Transform[], capture?: (transform: Transform) => void,
      bubble?: (transform: Transform) => void) {
    if (traversed.some(e => e.id === this.id)) return;
    traversed.push(this);
    if (capture) capture(this);
    this.children.forEach(e => {
      e.traverseRecursive(traversed, capture, bubble);
    });
    if (bubble) bubble(this);
  }

  traverse(
      capture?: (transform: Transform) => void,
      bubble?: (transform: Transform) => void) {
    const traversed: Transform[] = [];
    this.traverseRecursive(traversed, capture, bubble);
  }
}
