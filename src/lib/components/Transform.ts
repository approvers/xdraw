/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import { Component } from "../basis/Component";
import { Euler } from "../basis/Euler";
import { EventSource } from "../basis/EventSource";
import { Matrix4 } from "../basis/Matrix4";
import { Quaternion } from "../basis/Quaternion";
import { Sphere } from "../basis/Sphere";
import { Vector3 } from "../basis/Vector3";

let globalId = 0;

export class Transform extends Component {
  readonly id: number;

  name: string;

  parent: Transform | null = null;

  children: Transform[] = [];

  get root(): Transform {
    if (this.parent) {
      return this.parent.root;
    }
    return this;
  }

  position = new Vector3();

  quaternion = new Quaternion();

  scale = new Vector3(1, 1, 1);

  visible = true;

  receiveRaycast = true;

  static = false;

  private matrix = new Matrix4();

  get localMatrix(): Matrix4 {
    return this.matrix.clone();
  }

  private matrixWorld = new Matrix4();

  get worldMatrix(): Matrix4 {
    return this.matrixWorld.clone();
  }

  private matrixWorldProjection = new Matrix4();

  get projectionMatrix(): Matrix4 {
    return this.matrixWorldProjection.clone();
  }

  private matrixWorldNeedsUpdate = true;

  renderOrder = 0;

  castShadow = true;

  receiveShadow = true;

  // Lazy boundings
  boundingSphere: Sphere | null = null;

  readonly willUpdate = new EventSource<Transform>();

  readonly didUpdate = new EventSource<Transform>();

  readonly willUpdateMatrix = new EventSource<Transform>();

  readonly didUpdateMatrix = new EventSource<Transform>();

  constructor() {
    super();
    this.id = globalId;
    globalId += 1;
    this.name = `${this.id}`;
  }

  add(newChild: Transform): void {
    this.children.push(newChild);
    newChild.parent = this;
  }

  update(): void {
    this.traverse(
      (t) => {
        t.updateMatrix();
      },
      (t) => {
        t.updateMatrixWorld();
      },
    );
  }

  static newScene(): Transform {
    const root = new Transform();
    root.name += "SceneRoot";
    return root;
  }

  static get up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  static get down(): Vector3 {
    return new Vector3(0, -1, 0);
  }

  static get back(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  static get front(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  static get left(): Vector3 {
    return new Vector3(-1, 0, 0);
  }

  static get right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  clone(): Component {
    const newT = new Transform();
    newT.name = `${this.name}(Clone)`;
    newT.parent = this.parent;

    newT.position = this.position.clone();
    newT.quaternion = this.quaternion.clone();
    newT.scale = this.scale.clone();
    newT.visible = this.visible;
    newT.receiveRaycast = this.receiveRaycast;

    newT.matrix = this.matrix.clone();
    newT.matrixWorld = this.matrixWorld.clone();

    newT.renderOrder = this.renderOrder;

    newT.castShadow = this.castShadow;
    newT.receiveShadow = this.receiveShadow;

    newT.boundingSphere = this.boundingSphere;
    return newT;
  }

  computeBoundingSphere(vertices: Vector3[]): Sphere {
    return (this.boundingSphere = Sphere.fromPoints(vertices));
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

  translate(amount: Vector3): void {
    this.position = this.position.add(amount);
  }

  rotate(amount: Euler): void {
    this.quaternion = Quaternion.fromEuler(amount).multiply(this.quaternion);
  }

  lookAt(target: Vector3): void {
    /*
     * This method does not support objects having
     * Non-uniformly-scaled parent(s)
     */
    this.updateMatrix();

    const position = Vector3.fromMatrixPosition(this.matrixWorld);

    this.quaternion = Quaternion.fromRotationMatrix(
      Matrix4.lookAt(target, position, Transform.up),
    );

    if (this.parent) {
      const m1 = Matrix4.extractRotation(this.parent.matrixWorld);
      const q1 = Quaternion.fromRotationMatrix(m1);
      this.quaternion = this.quaternion.premultiply(q1.inverse());
    }
  }

  applyProjection(matrix: Matrix4): void {
    this.matrixWorldProjection = matrix.multiply(this.matrixWorld);
  }

  private traverseRecursive(
    traversed: Transform[],
    capture?: (transform: Transform) => void,
    bubble?: (transform: Transform) => void,
  ) {
    if (traversed.some((e) => e.id === this.id)) {
      return;
    }
    traversed.push(this);
    if (capture) {
      capture(this);
    }
    this.children.forEach((e) => {
      e.traverseRecursive(traversed, capture, bubble);
    });
    if (bubble) {
      bubble(this);
    }
  }

  traverse(
    capture?: (transform: Transform) => void,
    bubble?: (transform: Transform) => void,
  ): void {
    const traversed: Transform[] = [];
    this.traverseRecursive(traversed, capture, bubble);
  }
}
