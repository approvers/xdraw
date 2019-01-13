/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class Vector2 {
  x: number;
  y: number;

  constructor(x, y) {
    this.x = x || 0;
    this.y = y || 0;
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

  set(x, y) {
    this.x = x;
    this.y = y;
    return this;
  }

  setScalar(s) {
    this.x = this.y = s;
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

  setComponent(index, v) {
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
  getComponent(index) {
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

  add(v) {
    this.x += v.x;
    this.y += v.y;
    return this;
  }
  addScalar(s) {
    this.x += s;
    this.y += s;
    return this;
  }

  sub(v) {
    this.x -= v.x;
    this.y -= v.y;
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
    return this;
  }
  multiplyScalar(s) {
    this.x *= s;
    this.y *= s;
    return this;
  }

  divide(v) {
    this.x /= v.x;
    this.y /= v.y;
    return this;
  }
  divideScalar(s) {
    return this.multiplyScalar(1 / s);
  }

  applyMatrix3(m) {
    const {x, y} = this, e = m.elements;
    this.x = e[0] * x + e[3] * y + e[6];
    this.y = e[1] * x + e[4] * y + e[7];
    return this;
  }

  min(v) {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    return this;
  }
  max(v) {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    return this;
  }

  clamp(min, max) {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }
  clampScalar(min, max) {
    return this.clamp(new Vector2(min, min), new Vector2(max, max));
  }
  clampLength(min, max) {
    const len = this.length();
    return this.divideScalar(length || 1)
        .multiplyScalar(Math.max(min, Math.min(max, len)));
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
  dot(v) {
    return this.x * v.x + this.y * v.y;
  }
  cross(v) {
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
    if (angle < 0) angle += 2 * Math.PI;
    return angle;
  }

  distanceTo(v) {
    return Math.sqrt(this.distanceToSquared(v));
  }
  distanceToSquared(v) {
    const d = this.clone().sub(v);
    return d.lengthSq();
  }

  manhattanDistanceTo(v) {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  setLength(length) {
    return this.normalize().multiplyScalar(length);
  }

  lerp(v, alpha) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    return this;
  }

  equals(v) {
    return v.x === this.x && v.y === this.y;
  }

  fromArray(array, offset) {
    offset = offset || 0;
    this.x = array[offset];
    this.y = array[offset + 1];
    return this;
  }

  toArray(array, offset) {
    array = array || [];
    offset = offset || 0;
    array[offset] = this.x;
    array[offset + 1] = this.y;
    return array;
  }

  fromBufferAttribute(attribute, index) {
    this.x = attribute.getX(index);
    this.y = attribute.getY(index);
    return this;
  }

  rotateAround(center, angle) {
    const ox = Math.cos(angle), oy = Math.sin(angle);
    const dx = this.x - center.x;
    const dy = this.y - center.y;
    this.x = dx * ox - dy * oy + center.x;
    this.y = dx * oy + dy * ox + center.y;
    return this;
  }
}
