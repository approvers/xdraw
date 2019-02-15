"use strict";
/**
  * @author RkEclair / https://github.com/RkEclair
  */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("./Vector3");
class Matrix3 {
    constructor(elements = [1, 0, 0, 0, 1, 0, 0, 0, 1]) {
        this.elements = elements;
    }
    static identity() {
        return new Matrix3([1, 0, 0, 0, 1, 0, 0, 0, 1]);
    }
    static fromUvTransform(tx, ty, sx, sy, rotation, cx, cy) {
        const c = Math.cos(rotation);
        const s = Math.sin(rotation);
        return new Matrix3([
            sx * c, sx * s, -sx * (c * cx + s * cy) + cx + tx, -sy * s, sy * c,
            -sy * (-s * cx + c * cy) + cy + ty, 0, 0, 1
        ]);
    }
    static fromMatrix4(m) {
        const me = m.elements;
        return new Matrix3([me[0], me[4], me[8], me[1], me[5], me[9], me[2], me[6], me[10]]);
    }
    static multiplyMatrices(a, b) {
        const newM = new Matrix3();
        const ae = a.elements;
        const be = b.elements;
        const te = newM.elements;
        const a11 = ae[0], a12 = ae[3], a13 = ae[6];
        const a21 = ae[1], a22 = ae[4], a23 = ae[7];
        const a31 = ae[2], a32 = ae[5], a33 = ae[8];
        const b11 = be[0], b12 = be[3], b13 = be[6];
        const b21 = be[1], b22 = be[4], b23 = be[7];
        const b31 = be[2], b32 = be[5], b33 = be[8];
        te[0] = a11 * b11 + a12 * b21 + a13 * b31;
        te[3] = a11 * b12 + a12 * b22 + a13 * b32;
        te[6] = a11 * b13 + a12 * b23 + a13 * b33;
        te[1] = a21 * b11 + a22 * b21 + a23 * b31;
        te[4] = a21 * b12 + a22 * b22 + a23 * b32;
        te[7] = a21 * b13 + a22 * b23 + a23 * b33;
        te[2] = a31 * b11 + a32 * b21 + a33 * b31;
        te[5] = a31 * b12 + a32 * b22 + a33 * b32;
        te[8] = a31 * b13 + a32 * b23 + a33 * b33;
        return newM;
    }
    clone() {
        const newM = new Matrix3();
        for (let i = 0; i < 9; i++) {
            newM.elements[i] = this.elements[i];
        }
        return newM;
    }
    copy(m) {
        const te = this.elements;
        const me = m.elements;
        te[0] = me[0];
        te[1] = me[1];
        te[2] = me[2];
        te[3] = me[3];
        te[4] = me[4];
        te[5] = me[5];
        te[6] = me[6];
        te[7] = me[7];
        te[8] = me[8];
        return this;
    }
    applyToBufferAttribute(attribute) {
        const v1 = new Vector3_1.default();
        for (let i = 0; i < attribute.count; i++) {
            v1.x = attribute.getX(i);
            v1.y = attribute.getY(i);
            v1.z = attribute.getZ(i);
            v1.applyMatrix3(this);
            attribute.setXYZ(i, v1.x, v1.y, v1.z);
        }
        return attribute;
    }
    multiply(m) {
        const ae = this.elements;
        const be = m.elements;
        const a11 = ae[0], a12 = ae[3], a13 = ae[6];
        const a21 = ae[1], a22 = ae[4], a23 = ae[7];
        const a31 = ae[2], a32 = ae[5], a33 = ae[8];
        const b11 = be[0], b12 = be[3], b13 = be[6];
        const b21 = be[1], b22 = be[4], b23 = be[7];
        const b31 = be[2], b32 = be[5], b33 = be[8];
        ae[0] = a11 * b11 + a12 * b21 + a13 * b31;
        ae[3] = a11 * b12 + a12 * b22 + a13 * b32;
        ae[6] = a11 * b13 + a12 * b23 + a13 * b33;
        ae[1] = a21 * b11 + a22 * b21 + a23 * b31;
        ae[4] = a21 * b12 + a22 * b22 + a23 * b32;
        ae[7] = a21 * b13 + a22 * b23 + a23 * b33;
        ae[2] = a31 * b11 + a32 * b21 + a33 * b31;
        ae[5] = a31 * b12 + a32 * b22 + a33 * b32;
        ae[8] = a31 * b13 + a32 * b23 + a33 * b33;
    }
    premultiply(m) {
        return m.multiply(this);
    }
    multiplyScalar(s) {
        const te = this.elements;
        te[0] *= s;
        te[3] *= s;
        te[6] *= s;
        te[1] *= s;
        te[4] *= s;
        te[7] *= s;
        te[2] *= s;
        te[5] *= s;
        te[8] *= s;
        return this;
    }
    determinant() {
        const te = this.elements;
        const a = te[0], b = te[1], c = te[2], d = te[3], e = te[4], f = te[5], g = te[6], h = te[7], i = te[8];
        return (a * e * i - a * f * h - b * d * i + b * f * g + c * d * h - c * e * g);
    }
    inverse(m) {
        const me = m.elements, te = this.elements, n11 = me[0], n21 = me[1], n31 = me[2], n12 = me[3], n22 = me[4], n32 = me[5], n13 = me[6], n23 = me[7], n33 = me[8], t11 = n33 * n22 - n32 * n23, t12 = n32 * n13 - n33 * n12, t13 = n23 * n12 - n22 * n13, det = this.determinant();
        if (det === 0) {
            console.error(`ArgumentError: The determinant of ${m} is 0.`);
            return Matrix3.identity();
        }
        const detInv = 1 / det;
        te[0] = t11 * detInv;
        te[1] = (n31 * n23 - n33 * n21) * detInv;
        te[2] = (n32 * n21 - n31 * n22) * detInv;
        te[3] = t12 * detInv;
        te[4] = (n33 * n11 - n31 * n13) * detInv;
        te[5] = (n31 * n12 - n32 * n11) * detInv;
        te[6] = t13 * detInv;
        te[7] = (n21 * n13 - n23 * n11) * detInv;
        te[8] = (n22 * n11 - n21 * n12) * detInv;
        return this;
    }
    transpose() {
        const m = this.elements;
        [m[1], m[3]] = [m[3], m[1]];
        [m[2], m[6]] = [m[6], m[2]];
        [m[5], m[7]] = [m[7], m[5]];
        return this;
    }
    normalMatrix(matrix4) {
        return Matrix3.fromMatrix4(matrix4).inverse(this).transpose();
    }
    transposeIntoArray(_r) {
        _r = this.elements.slice();
        return this;
    }
    scale(sx, sy) {
        const te = this.elements;
        te[0] *= sx;
        te[3] *= sx;
        te[6] *= sx;
        te[1] *= sy;
        te[4] *= sy;
        te[7] *= sy;
        return this;
    }
    rotate(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const te = this.elements;
        const a11 = te[0], a12 = te[3], a13 = te[6];
        const a21 = te[1], a22 = te[4], a23 = te[7];
        te[0] = c * a11 + s * a21;
        te[3] = c * a12 + s * a22;
        te[6] = c * a13 + s * a23;
        te[1] = -s * a11 + c * a21;
        te[4] = -s * a12 + c * a22;
        te[7] = -s * a13 + c * a23;
        return this;
    }
    translate(tx, ty) {
        const te = this.elements;
        te[0] += tx * te[2];
        te[3] += tx * te[5];
        te[6] += tx * te[8];
        te[1] += ty * te[2];
        te[4] += ty * te[5];
        te[7] += ty * te[8];
        return this;
    }
    equals(matrix) {
        const te = this.elements;
        const me = matrix.elements;
        for (let i = 0; i < 9; i++) {
            if (te[i] !== me[i])
                return false;
        }
        return true;
    }
    toArray(array = [], offset = 0) {
        const te = this.elements;
        array[offset] = te[0];
        array[offset + 1] = te[1];
        array[offset + 2] = te[2];
        array[offset + 3] = te[3];
        array[offset + 4] = te[4];
        array[offset + 5] = te[5];
        array[offset + 6] = te[6];
        array[offset + 7] = te[7];
        array[offset + 8] = te[8];
        return array;
    }
}
exports.default = Matrix3;
