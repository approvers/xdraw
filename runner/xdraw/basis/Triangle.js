"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = require("./Vector2");
const Vector3_1 = require("./Vector3");
/**
 * @author RkEclair / https://github.com/RkEclair
 */
class Triangle {
    constructor(a = new Vector3_1.default(), b = new Vector3_1.default(), c = new Vector3_1.default()) {
        this.a = a;
        this.b = b;
        this.c = c;
    }
    normal() {
        const calced = this.c.clone().sub(this.b), v0 = this.a.clone().sub(this.b);
        calced.cross(v0);
        const len = calced.lengthSq();
        if (0 < len) {
            return calced.multiplyScalar(1 / Math.sqrt(len));
        }
        return new Vector3_1.default();
    }
    barycoord(point) {
        const v0 = this.c.clone().sub(this.a);
        const v1 = this.b.clone().sub(this.a);
        const v2 = point.clone().sub(this.a);
        const dot00 = v0.dot(v0);
        const dot01 = v0.dot(v1);
        const dot02 = v0.dot(v2);
        const dot11 = v1.dot(v1);
        const dot12 = v1.dot(v2);
        const denom = dot00 * dot11 - dot01 * dot01;
        // collinear or singular triangle
        if (denom === 0) {
            // arbitrary location outside of triangle?
            // not sure if this is the best idea, maybe should be returning undefined
            return new Vector3_1.default(-2, -1, -1);
        }
        const invDenom = 1 / denom;
        const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
        const v = (dot00 * dot12 - dot01 * dot02) * invDenom;
        // barycentric coordinates must always sum to 1
        return new Vector3_1.default(1 - u - v, v, u);
    }
    uv(point, uv) {
        const calced = new Vector2_1.default(0, 0), bary = this.barycoord(point);
        calced.add(uv[0].multiplyScalar(bary.x));
        calced.add(uv[1].multiplyScalar(bary.y));
        calced.add(uv[2].multiplyScalar(bary.z));
        return calced;
    }
}
exports.default = Triangle;
