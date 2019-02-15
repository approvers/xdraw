"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vector4_1 = require("./Vector4");
const Vector3_1 = require("./Vector3");
const Vector2_1 = require("./Vector2");
const Color_1 = require("./Color");
class BufferAttribute {
    constructor(array, itemSize, normalized = false, name = '') {
        this.array = array;
        this.itemSize = itemSize;
        this.normalized = normalized;
        this.name = name;
        this.count = array.length / itemSize;
    }
    static fromArray(buffer, array, itemSize, normalized = false) {
        return new BufferAttribute(new buffer(array), itemSize, normalized);
    }
    get length() { return this.count; }
    clone() {
        const newB = new BufferAttribute(this.array, this.itemSize, this.normalized, this.name);
        newB.needsUpdate = this.needsUpdate;
        return newB;
    }
    getX(i) {
        return this.array[i * this.itemSize];
    }
    getY(i) {
        return this.array[i * this.itemSize + 1];
    }
    getZ(i) {
        return this.array[i * this.itemSize + 2];
    }
    getW(i) {
        return this.array[i * this.itemSize + 3];
    }
    setX(i, v) {
        this.array[i * this.itemSize] = v;
    }
    setY(i, v) {
        this.array[i * this.itemSize + 1] = v;
    }
    setZ(i, v) {
        this.array[i * this.itemSize + 2] = v;
    }
    setW(i, v) {
        this.array[i * this.itemSize + 3] = v;
    }
    setXY(index, x, y) {
        index *= this.itemSize;
        this.array[index + 0] = x;
        this.array[index + 1] = y;
        return this;
    }
    setXYZ(index, x, y, z) {
        index *= this.itemSize;
        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;
        return this;
    }
    setXYZW(index, x, y, z, w) {
        index *= this.itemSize;
        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;
        this.array[index + 3] = w;
        return this;
    }
    copyArray(array) {
        this.array.set(array);
        return this;
    }
    copyColorsArray(colors) {
        const array = this.array;
        let offset = 0;
        for (let color of colors) {
            if (color === undefined) {
                color = new Color_1.default(0);
            }
            array[offset++] = color.r;
            array[offset++] = color.g;
            array[offset++] = color.b;
        }
        return this;
    }
    copyVector2sArray(vectors) {
        const array = this.array;
        let offset = 0;
        for (let vector of vectors) {
            if (vector === undefined) {
                vector = new Vector2_1.default();
            }
            array[offset++] = vector.x;
            array[offset++] = vector.y;
        }
        return this;
    }
    copyVector3sArray(vectors) {
        const array = this.array;
        let offset = 0;
        for (let vector of vectors) {
            if (vector === undefined) {
                vector = new Vector3_1.default();
            }
            array[offset++] = vector.x;
            array[offset++] = vector.y;
            array[offset++] = vector.z;
        }
        return this;
    }
    copyVector4sArray(vectors) {
        const array = this.array;
        let offset = 0;
        for (let vector of vectors) {
            if (vector === undefined) {
                vector = new Vector4_1.default();
            }
            array[offset++] = vector.x;
            array[offset++] = vector.y;
            array[offset++] = vector.z;
            array[offset++] = vector.w;
        }
        return this;
    }
}
exports.default = BufferAttribute;
