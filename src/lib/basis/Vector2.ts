import BufferAttribute from "./BufferAttribute";
import Matrix3 from "./Matrix3";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Vector2 {
  constructor(public x: number = 0, public y: number = 0) {}

  static fromArray(array: number[], offset = 0) {
    const x = array[offset];
    const y = array[offset + 1];
    return new Vector2(x, y);
  }

  static fromBufferAttribute(attribute: BufferAttribute, index: number) {
    const x = attribute.getX(index);
    const y = attribute.getY(index);
    return new Vector2(x, y);
  }

  get width() {
    return this.x;
  }

  set width(v) {
    this.x = v;
  }

  get height() {
    return this.y;
  }

  set height(v) {
    this.y = v;
  }

  setScalar(s: number) {
    this.x = this.y = s;
    return this;
  }

  setX(x: number) {
    this.x = x;
    return this;
  }

  setY(y: number) {
    this.y = y;
    return this;
  }

  setComponent(index: number, v: number) {
    switch (index || -1) {
      case 0:
        this.x = v;
        break;
      case 1:
        this.y = v;
        break;
      default:
        throw new Error(`OutOfRange:${index}`);
    }
    return this;
  }

  getComponent(index: number) {
    switch (index || -1) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error(`OutOfRange:${index}`);
    }
  }

  clone() {
    return new Vector2(this.x, this.y);
  }

  add(v: Vector2) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s: number) {
    this.x += s;
    this.y += s;
    return this;
  }

  sub(v: Vector2) {
    this.x -= v.x;
    this.y -= v.y;
    return this;
  }

  subScalar(s: number) {
    this.x -= s;
    this.y -= s;
    return this;
  }

  multiply(v: Vector2) {
    this.x *= v.x;
    this.y *= v.y;
    return this;
  }

  multiplyScalar(s: number) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  divide(v: Vector2) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }

  divideScalar(s: number) {
    return this.multiplyScalar(1 / s);
  }

  applyMatrix3(m: Matrix3) {
    const { x, y } = this,
      e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];
    return this;
  }

  min(v: Vector2) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }

  max(v: Vector2) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  clamp(min: Vector2, max: Vector2) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }

  clampScalar(min: number, max: number) {
    return this.clamp(new Vector2(min, min), new Vector2(max, max));
  }

  clampLength(min: number, max: number) {
    const len = this.length();
    return this.divideScalar(length || 1).multiplyScalar(
      Math.max(min, Math.min(max, len)),
    );
  }

  floor() {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    return this;
  }

  ceil() {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    return this;
  }

  round() {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    return this;
  }

  roundToZero() {
    this.x = this.x < 0 ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = this.y < 0 ? Math.ceil(this.y) : Math.floor(this.y);
    return this;
  }

  negate() {
    this.x = -this.x;
    this.y = -this.y;
    return this;
  }

  dot(v: Vector2) {
    return this.x * v.x + this.y * v.y;
  }

  cross(v: Vector2) {
    return this.x * v.y - this.y * v.x;
  }

  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }

  length() {
    return Math.sqrt(this.lengthSq());
  }

  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  normalize() {
    return this.divideScalar(this.length() || 1);
  }

  angle() {
    let angle = Math.atan2(this.y, this.x);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    return angle;
  }

  distanceTo(v: Vector2) {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(v: Vector2) {
    const d = this.sub(v);
    return d.lengthSq();
  }

  manhattanDistanceTo(v: Vector2) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  setLength(length: number) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v: Vector2, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  equals(v: Vector2) {
    return v.x === this.x && v.y === this.y;
  }

  toArray(array: number[] = [], offset = 0) {
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }

  rotateAround(center: Vector2, angle: number) {
    const ox = Math.cos(angle),
      oy = Math.sin(angle);
    const dx = this.x - center.x;
    const dy = this.y - center.y;
    this.x = dx * ox - dy * oy + center.x;
    this.y = dx * oy + dy * ox + center.y;
    return this;
  }
}
