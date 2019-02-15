"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Euler_1 = require("./Euler");
const EventSource_1 = require("./EventSource");
const Matrix4_1 = require("./Matrix4");
const Quaternion_1 = require("./Quaternion");
const Sphere_1 = require("./Sphere");
const Vector3_1 = require("./Vector3");
const Matrix3_1 = require("./Matrix3");
const Components_1 = require("./Components");
let globalId = 0;
class Transform extends EventSource_1.default {
    constructor(comps = new Components_1.default()) {
        super();
        this.comps = comps;
        this.parent = null;
        this.children = [];
        this.position = new Vector3_1.default();
        this.rotation = new Euler_1.default();
        this.quaternion = new Quaternion_1.default();
        this.scale = new Vector3_1.default(1, 1, 1);
        this.visible = true;
        this.recieveRaycast = true;
        this.matrix = new Matrix4_1.default();
        this.matrixWorld = new Matrix4_1.default();
        this.matrixWorldInverse = new Matrix4_1.default();
        this.modelViewMatrix = new Matrix4_1.default();
        this.projectionMatrix = new Matrix4_1.default();
        this.projectionMatrixInverse = new Matrix4_1.default();
        this.normalMatrix = new Matrix3_1.default();
        this.matrixAutoUpdate = true;
        this.matrixWorldNeedsUpdate = true;
        this.renderOrder = 0;
        this.id = globalId++;
        this.name = `${this.id}`;
    }
    add(newChild) {
        this.children.push(newChild);
        newChild.parent = this;
    }
    update() {
        this.comps.process(this);
        this.updateMatrix();
    }
    static get up() { return new Vector3_1.default(0, 1, 0); }
    static get down() { return new Vector3_1.default(0, -1, 0); }
    static get back() { return new Vector3_1.default(0, 0, -1); }
    static get front() { return new Vector3_1.default(0, 0, 1); }
    static get left() { return new Vector3_1.default(-1, 0, 0); }
    static get right() { return new Vector3_1.default(1, 0, 0); }
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
    computeBoundingSphere(vertices) {
        return this.boundingSphere = Sphere_1.default.fromPoints(vertices);
    }
    updateMatrix() {
        this.matrix = Matrix4_1.default.compose(this.position, this.quaternion, this.scale);
        this.matrixWorldNeedsUpdate = true;
    }
    updateMatrixWorld(force = false) {
        if (this.matrixAutoUpdate)
            this.updateMatrix();
        if (this.matrixWorldNeedsUpdate || force) {
            if (this.parent === null) {
                this.matrixWorld = this.matrix.clone();
            }
            else {
                this.matrixWorld =
                    this.parent.matrixWorld.clone().multiply(this.matrix);
            }
            this.matrixWorldNeedsUpdate = false;
            force = true;
        }
        this.children.forEach((e) => e.updateMatrixWorld(force));
    }
    updateWorldMatrix(updateParents, updateChildren) {
        const parent = this.parent;
        if (updateParents === true && parent !== null) {
            parent.updateWorldMatrix(true, false);
        }
        if (this.matrixAutoUpdate)
            this.updateMatrix();
        if (this.parent === null) {
            this.matrixWorld = this.matrix.clone();
        }
        else {
            this.matrixWorld = this.parent.matrixWorld.clone().multiply(this.matrix);
        }
        // update children
        if (updateChildren === true) {
            this.children.forEach(e => e.updateWorldMatrix(false, true));
        }
    }
    lookAt(target) {
        this.updateWorldMatrix(true, false);
        const position = Vector3_1.default.fromMatrixPosition(this.matrixWorld);
        this.quaternion = Quaternion_1.default.fromRotationMatrix(Matrix4_1.default.lookAt(target, position, Transform.up));
        if (this.parent) {
            const m1 = Matrix4_1.default.extractRotation(this.parent.matrixWorld);
            const q1 = Quaternion_1.default.fromRotationMatrix(m1);
            this.quaternion.premultiply(q1.inverse());
        }
    }
    traverseRecursive(func, traversed) {
        if (traversed.some(e => e === this))
            return;
        traversed.push(this);
        this.children.forEach(e => {
            func(e);
            e.traverseRecursive(func, traversed);
        });
    }
    traverse(func) {
        const traversed = [];
        this.children.forEach(e => {
            func(e);
            e.traverseRecursive(func, traversed);
        });
    }
}
exports.default = Transform;
