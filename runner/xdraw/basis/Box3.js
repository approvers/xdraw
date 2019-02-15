"use strict";
/**
 * @author RkEclait / https://RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("./Vector3");
class Box3 {
    constructor(min = new Vector3_1.default(+Infinity, +Infinity, +Infinity), max = new Vector3_1.default(-Infinity, -Infinity, -Infinity)) {
        this.min = min;
        this.max = max;
    }
    static fromPoints(points) {
        const box = new Box3();
        box.min = points.reduce((acc, cur) => acc.min(cur), box.min);
        box.max = points.reduce((acc, cur) => acc.max(cur), box.max);
        return box;
    }
    clone() {
        throw new Error("Method not implemented.");
    }
    empty() {
        return (this.max.x < this.min.x || this.max.y < this.min.y ||
            this.max.z < this.min.z);
    }
    getCenter() {
        if (this.empty())
            return new Vector3_1.default();
        return this.min.lerp(this.max, 0.5);
    }
}
exports.default = Box3;
