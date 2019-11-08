/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Euler from './Euler';
import EventSource from './EventSource';
import Matrix4 from './Matrix4';
import Quaternion from './Quaternion';
import Sphere from './Sphere';
import Vector3 from './Vector3';

export class Store {
  private prop: {[key: string]: any} = {};

  addProp<T>(name: string, initValue: T): T {
    if (this.prop[name] === undefined) {
      this.prop[name] = initValue;
    }

    return this.prop[name];
  }

  get props() {
    return this.prop;
  }

  private state: any[] = [];
  private currState = 0;

  addState<T>(initValue: T): [() => T, (newValue: T) => void] {
    if (this.state[this.currState] === undefined) {
      this.state[this.currState] = initValue;
    }

    const thisState: number = this.currState;
    ++this.currState;

    return [
      (): T => this.state[thisState],
      (newValue: T) => {
        this.state[thisState] = newValue;
      }
    ];
  }

  reset() {
    this.currState = 0;
  }

  addEvent(...dependencies: any[]): Promise<void> {
    const currentEvent = this.state[this.currState];
    const wasChanged = currentEvent !== undefined &&
        dependencies.some((e, i) => e !== currentEvent[i]);

    const currEvent = this.currState;
    ++this.currState;
    if (dependencies.length === 0 || wasChanged) {
      return Promise.resolve().then(() => {
        this.state[currEvent] = dependencies;
      });
    }
    return Promise.reject();
  }
}

export class Component<Props = {}> {
  protected store = new Store();
  static defaultProps: Props = {};

  start?(transform: Transform, props: Props): void;
  run?(transform: Transform, props: Props): void;
}

let globalId = 0;

export default class Transform {
  readonly id: number;
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
  matrixWorldProjection = new Matrix4();
  matrixWorldNeedsUpdate = true;

  renderOrder: number = 0;

  castShadow = true;
  recieveShadow = true;

  // lazy boundings
  boundingSphere: Sphere|null = null;

  readonly willUpdate = new EventSource<Transform>();
  readonly didUpdate = new EventSource<Transform>();
  readonly willUpdateMatrix = new EventSource<Transform>();
  readonly didUpdateMatrix = new EventSource<Transform>();
  readonly awake = new EventSource<Transform>();
  readonly start = new EventSource<Transform>();
  readonly dispose = new EventSource<Transform>();

  constructor(public readonly comps: Component[] = []) {
    this.id = globalId++;
    this.name = `${this.id}`;
  }

  add(newChild: Transform) {
    this.children.push(newChild);
    newChild.parent = this;
  }

  addComponent(component: Component) {
    return this.comps.push(component);
  }

  private update() {
    for (const component of this.comps) {
      component.run(this, {});
    }
  }

  flush() {}  // injected from newScene

  static newScene() {
    const root = new Transform;
    root.name += 'SceneRoot';
    root.flush = () => {
      const components: {order: number; run: () => void;}[] = [];
      root.traverse(
          (t) => {
            t.updateMatrix();
          },
          (t) => {
            t.updateMatrixWorld();
          });
      components.sort((a, b) => a.order - b.order);
      components.forEach(e => e.run());
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
    const newT = new Transform([...this.comps]);
    newT.name = this.name + '(Clone)';
    newT.parent = this.parent;

    newT.position = this.position.clone();
    newT.quaternion = this.quaternion.clone();
    newT.scale = this.scale.clone();
    newT.visible = this.visible;
    newT.recieveRaycast = this.recieveRaycast;

    newT.matrix = this.matrix.clone();
    newT.matrixWorld = this.matrixWorld.clone();

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
    if (this.matrixWorldNeedsUpdate || force) {
      this.matrixWorldNeedsUpdate = false;
      if (this.parent === null) {
        this.matrixWorld = this.matrix.clone();
      } else {
        this.matrixWorld = this.parent.matrixWorld.multiply(this.matrix);
      }
    }
  }

  translate(amount: Vector3) {
    this.position = this.position.add(amount);
  }

  rotate(amount: Euler) {
    this.quaternion = Quaternion.fromEuler(amount).multiply(this.quaternion);
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
      this.quaternion = this.quaternion.premultiply(q1.inverse());
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
