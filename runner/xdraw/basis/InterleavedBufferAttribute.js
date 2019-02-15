"use strict";
/**
 * @author benaadams / https://twitter.com/ben_a_adams
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
class InterleavedBufferAttribute {
    constructor(array, stride) {
        this.array = array;
        this.stride = stride;
        this.dynamic = false;
        this.offset = 0;
        this.version = 0;
        this.count = array.length / stride;
    }
    set needsUpdate(value) {
        if (value === true)
            this.version++;
    }
    copyAt(srcOffset, attribute, dstOffset) {
        srcOffset *= this.stride;
        dstOffset *= attribute.stride;
        for (let i = 0; i < this.stride; i++) {
            this.array[srcOffset + i] = attribute.array[dstOffset + i];
        }
        return this;
    }
    set(value, offset = 0) {
        this.array.set(value, offset);
        return this;
    }
    clone() {
        const newI = new InterleavedBufferAttribute(this.array.slice(), this.stride);
        newI.dynamic = this.dynamic;
        return newI;
    }
    setX(index, x) {
        this.array[index * this.stride + this.offset] = x;
        return this;
    }
    setY(index, y) {
        this.array[index * this.stride + this.offset + 1] = y;
        return this;
    }
    setZ(index, z) {
        this.array[index * this.stride + this.offset + 2] = z;
        return this;
    }
    setW(index, w) {
        this.array[index * this.stride + this.offset + 3] = w;
        return this;
    }
    getX(index) {
        return this.array[index * this.stride + this.offset];
    }
    getY(index) {
        return this.array[index * this.stride + this.offset + 1];
    }
    getZ(index) {
        return this.array[index * this.stride + this.offset + 2];
    }
    getW(index) {
        return this.array[index * this.stride + this.offset + 3];
    }
    setXY(index, x, y) {
        index = index * this.stride + this.offset;
        this.array[index + 0] = x;
        this.array[index + 1] = y;
        return this;
    }
    setXYZ(index, x, y, z) {
        index = index * this.stride + this.offset;
        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;
        return this;
    }
    setXYZW(index, x, y, z, w) {
        index = index * this.stride + this.offset;
        this.array[index + 0] = x;
        this.array[index + 1] = y;
        this.array[index + 2] = z;
        this.array[index + 3] = w;
        return this;
    }
}
exports.default = InterleavedBufferAttribute;
