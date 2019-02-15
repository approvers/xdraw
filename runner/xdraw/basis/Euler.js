"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Matrix4_1 = require("./Matrix4");
class Euler {
    constructor(x = 0, y = 0, z = 0, order = 'XYZ') {
        this.x = x;
        this.y = y;
        this.z = z;
        this.order = order;
    }
    static fromRotationMatrix(m, order) {
        const clamp = (src, min, max) => Math.max(Math.min(src, max), min);
        const te = m.elements;
        const m11 = te[0], m12 = te[4], m13 = te[8];
        const m21 = te[1], m22 = te[5], m23 = te[9];
        const m31 = te[2], m32 = te[6], m33 = te[10];
        let x, y, z;
        if (order === 'XYZ') {
            y = Math.asin(clamp(m13, -1, 1));
            if (Math.abs(m13) < 0.99999) {
                x = Math.atan2(-m23, m33);
                z = Math.atan2(-m12, m11);
            }
            else {
                x = Math.atan2(m32, m22);
                z = 0;
            }
        }
        else if (order === 'YXZ') {
            x = Math.asin(-clamp(m23, -1, 1));
            if (Math.abs(m23) < 0.99999) {
                y = Math.atan2(m13, m33);
                z = Math.atan2(m21, m22);
            }
            else {
                y = Math.atan2(-m31, m11);
                z = 0;
            }
        }
        else if (order === 'ZXY') {
            x = Math.asin(clamp(m32, -1, 1));
            if (Math.abs(m32) < 0.99999) {
                y = Math.atan2(-m31, m33);
                z = Math.atan2(-m12, m22);
            }
            else {
                y = 0;
                z = Math.atan2(m21, m11);
            }
        }
        else if (order === 'ZYX') {
            y = Math.asin(-clamp(m31, -1, 1));
            if (Math.abs(m31) < 0.99999) {
                x = Math.atan2(m32, m33);
                z = Math.atan2(m21, m11);
            }
            else {
                x = 0;
                z = Math.atan2(-m12, m22);
            }
        }
        else if (order === 'YZX') {
            z = Math.asin(clamp(m21, -1, 1));
            if (Math.abs(m21) < 0.99999) {
                x = Math.atan2(-m23, m22);
                y = Math.atan2(-m31, m11);
            }
            else {
                x = 0;
                y = Math.atan2(m13, m33);
            }
        }
        else if (order === 'XZY') {
            z = Math.asin(-clamp(m12, -1, 1));
            if (Math.abs(m12) < 0.99999) {
                x = Math.atan2(m32, m22);
                y = Math.atan2(m13, m11);
            }
            else {
                x = Math.atan2(-m23, m33);
                y = 0;
            }
        }
        else {
            throw new Error('ArgumentError: Illegal rotation order on Euler');
        }
        return new Euler(x, y, z, order);
    }
    static fromQuaternion(q, order) {
        const m = Matrix4_1.default.makeRotationFromQuaternion(q);
        return Euler.fromRotationMatrix(m, order);
    }
    clone() {
        return new Euler(this.x, this.y, this.z, this.order);
    }
}
exports.default = Euler;
