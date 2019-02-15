"use strict";
/**
 * @author RkEclair / https://RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("./Vector3");
class Plane {
    constructor(_normal = new Vector3_1.default(1, 0, 0), constant = 0) {
        this._normal = _normal;
        this.constant = constant;
    }
    set normal(v) {
        this._normal = v.clone();
    }
    get normal() {
        return this._normal;
    }
    setComponents(x, y, z, w) {
        this._normal = new Vector3_1.default(x, y, z);
        this.constant = w;
        return this;
    }
    clone() {
        return new Plane(this._normal.clone(), this.constant);
    }
    normalize() {
        const len = this.normal.length();
        if (len === 0)
            return;
        var inverseNormalLength = 1.0 / len;
        this.normal.multiplyScalar(inverseNormalLength);
        this.constant *= inverseNormalLength;
        return this;
    }
    distanceToPoint(p) {
        return this.normal.dot(p) + this.constant;
    }
}
exports.default = Plane;
