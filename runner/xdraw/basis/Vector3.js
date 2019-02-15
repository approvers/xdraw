"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Matrix4_1 = require("./Matrix4");
const Quaternion_1 = require("./Quaternion");
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }
    static fromSpherical(s) {
        return Vector3.fromSphericalCoords(s.radius, s.phi, s.theta);
    }
    static fromSphericalCoords(radius, phi, theta) {
        const sinPhiRadius = Math.sin(phi) * radius;
        const x = sinPhiRadius * Math.sin(theta);
        const y = Math.cos(phi) * radius;
        const z = sinPhiRadius * Math.cos(theta);
        return new Vector3(x, y, z);
    }
    static fromCylindrical(c) {
        return Vector3.fromCylindricalCoords(c.radius, c.theta, c.y);
    }
    static fromCylindricalCoords(radius, theta, y) {
        const x = radius * Math.sin(theta);
        const z = radius * Math.cos(theta);
        return new Vector3(x, y, z);
    }
    static fromMatrixPosition(m) {
        const e = m.elements;
        return new Vector3(e[12], e[13], e[14]);
    }
    static fromMatrixScale(m) {
        const [sx, sy, sz] = [0, 1, 2].map((e) => Vector3.fromMatrixColumn(m, e).length());
        return new Vector3(sx, sy, sz);
    }
    static fromMatrixColumn(m, index) {
        return this.fromArray(m.elements, index * 4);
    }
    static fromArray(array, offset = 0) {
        return new Vector3(array[offset], array[offset + 1], array[offset + 2]);
    }
    static fromBufferAttribute(attribute, index) {
        const x = attribute.getX(index);
        const y = attribute.getY(index);
        const z = attribute.getZ(index);
        return new Vector3(x, y, z);
    }
    setScalar(s) {
        this.x = this.y = this.z = s;
        return this;
    }
    setX(x) {
        this.x = x;
        return this;
    }
    setY(y) {
        this.y = y;
        return this;
    }
    setZ(z) {
        this.z = z;
        return this;
    }
    setComponent(index, v) {
        switch (index || -1) {
            case 0:
                this.x = v;
                break;
            case 1:
                this.y = v;
                break;
            case 2:
                this.z = v;
                break;
            default:
                throw new Error(`OutOfRange:${index}`);
        }
        return this;
    }
    getComponent(index) {
        switch (index || -1) {
            case 0:
                return this.x;
            case 1:
                return this.y;
            case 2:
                return this.z;
            default:
                throw new Error(`OutOfRange:${index}`);
        }
    }
    clone() {
        return new Vector3(this.x, this.y, this.z);
    }
    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }
    addScalar(s) {
        this.x += s;
        this.y += s;
        this.z += s;
        return this;
    }
    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }
    subScalar(s) {
        this.x -= s;
        this.y -= s;
        return this;
    }
    multiply(v) {
        this.x *= v.x;
        this.y *= v.y;
        this.z *= v.z;
        return this;
    }
    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }
    applyEuler(euler) {
        return this.applyQuaternion(Quaternion_1.default.fromEuler(euler));
    }
    applyAxisAngle(axis, angle) {
        return this.applyQuaternion(Quaternion_1.default.fromAxisAngle(axis, angle));
    }
    applyMatrix3(m) {
        const { x, y, z } = this, e = m.elements;
        this.x = e[0] * x + e[3] * y + e[6] * z;
        this.y = e[1] * x + e[4] * y + e[7] * z;
        this.z = e[2] * x + e[5] * y + e[8] * z;
        return this;
    }
    applyMatrix4(m) {
        const { x, y, z } = this, e = m.elements;
        const w = 1 / (e[3] * x + e[7] * y + e[11] * z + e[15]);
        this.x = (e[0] * x + e[4] * y + e[8] * z + e[12]) * w;
        this.y = (e[1] * x + e[5] * y + e[9] * z + e[13]) * w;
        this.z = (e[2] * x + e[6] * y + e[10] * z + e[14]) * w;
        return this;
    }
    applyQuaternion(q) {
        const { x, y, z } = this;
        const ix = q.w * x + q.y * z - q.z * y;
        const iy = q.w * y + q.z * x - q.x * z;
        const iz = q.w * z + q.x * y - q.y * x;
        const iw = -q.x * x - q.y * y - q.z * z;
        this.x = ix * q.w + iw * -q.x + iy * -q.z - iz * -q.y;
        this.y = iy * q.w + iw * -q.y + iz * -q.x - ix * -q.z;
        this.z = iz * q.w + iw * -q.z + ix * -q.y - iy * -q.x;
        return this;
    }
    project(t) {
        return this.applyMatrix4(t.matrixWorldInverse)
            .applyMatrix4(t.projectionMatrix);
    }
    unproject(t) {
        return this.applyMatrix4(new Matrix4_1.default().inverse(t.projectionMatrix))
            .applyMatrix4(t.matrixWorld);
    }
    affineTransform(m) {
        const { x, y, z } = this, e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z;
        this.y = e[1] * x + e[5] * y + e[9] * z;
        this.z = e[2] * x + e[6] * y + e[10] * z;
        return this.normalize();
    }
    divide(v) {
        this.x /= v.x;
        this.y /= v.y;
        this.z /= v.z;
        return this;
    }
    divideScalar(s) {
        return this.multiplyScalar(1 / s);
    }
    min(v) {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        this.z = Math.min(this.z, v.z);
        return this;
    }
    max(v) {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        this.z = Math.max(this.z, v.z);
        return this;
    }
    clamp(min, max) {
        this.x = Math.max(min.x, Math.min(max.x, this.x));
        this.y = Math.max(min.y, Math.min(max.y, this.y));
        this.z = Math.max(min.z, Math.min(max.z, this.z));
        return this;
    }
    clampScalar(min, max) {
        return this.clamp(new Vector3(min, min, min), new Vector3(max, max, max));
    }
    clampLength(min, max) {
        const len = this.length();
        return this.divideScalar(length || 1)
            .multiplyScalar(Math.max(min, Math.min(max, len)));
    }
    floor() {
        this.x = Math.floor(this.x);
        this.y = Math.floor(this.y);
        this.z = Math.floor(this.z);
        return this;
    }
    ceil() {
        this.x = Math.ceil(this.x);
        this.y = Math.ceil(this.y);
        this.z = Math.ceil(this.z);
        return this;
    }
    round() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        this.z = Math.round(this.z);
        return this;
    }
    roundToZero() {
        this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
        this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
        this.z = this.z < 0 ? Math.ceil(this.z) : Math.floor(this.z);
        return this;
    }
    negate() {
        this.x = -this.x;
        this.y = -this.y;
        this.z = -this.z;
        return this;
    }
    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }
    cross(v) {
        const { x, y, z } = this, { x: vx, y: vy, z: vz } = v, vec = new Vector3();
        vec.x = y * vz - z * vy;
        vec.y = z * vx - x * vz;
        vec.z = x * vy - y * vx;
        return vec;
    }
    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }
    length() {
        return Math.sqrt(this.lengthSq());
    }
    manhattanLength() {
        return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
    }
    normalize() {
        return this.divideScalar(this.length() || 1);
    }
    setLength(length) {
        return this.normalize().multiplyScalar(length);
    }
    lerp(v, alpha) {
        const x = this.x + (v.x - this.x) * alpha;
        const y = this.y + (v.y - this.y) * alpha;
        const z = this.z + (v.z - this.z) * alpha;
        return new Vector3(x, y, z);
    }
    projectOnVector(v) {
        const scalar = v.dot(this) / v.lengthSq();
        return v.clone().multiplyScalar(scalar);
    }
    projectOnPlane(p) {
        return this.sub(this.clone().projectOnVector(p));
    }
    reflect(normal) {
        return this.sub(normal.clone().multiplyScalar(2 * this.dot(normal)));
    }
    angleTo(v) {
        const theta = this.dot(v) / Math.sqrt(this.lengthSq() * v.lengthSq());
        return Math.acos(Math.min(Math.max(theta, -1), 1));
    }
    distanceTo(v) {
        return Math.sqrt(this.distanceToSquared(v));
    }
    distanceToSquared(v) {
        const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
        return dx * dx + dy * dy + dz * dz;
    }
    manhattanDistanceTo(v) {
        return (Math.abs(this.x - v.x) + Math.abs(this.y - v.y) +
            Math.abs(this.z - v.z));
    }
    transformDirection(m) {
        const x = this.x, y = this.y, z = this.z;
        const e = m.elements;
        this.x = e[0] * x + e[4] * y + e[8] * z;
        this.y = e[1] * x + e[5] * y + e[9] * z;
        this.z = e[2] * x + e[6] * y + e[10] * z;
        return this.normalize();
    }
    equals(v) {
        return v.x === this.x && v.y === this.y;
    }
    toArray(array = [], offset = 0) {
        array[offset] = this.x;
        array[offset + 1] = this.y;
        array[offset + 2] = this.z;
        return array;
    }
}
exports.default = Vector3;
exports.Up = new Vector3(0, 1, 0);
