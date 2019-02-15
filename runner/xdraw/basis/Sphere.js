"use strict";
/**
 * @author RkEclair / https://RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("./Vector3");
const Box3_1 = require("./Box3");
class Sphere {
    constructor(_center = new Vector3_1.default(), radius = 0) {
        this._center = _center;
        this.radius = radius;
    }
    static fromPoints(points, center) {
        const box = Box3_1.default.fromPoints(points);
        if (center === undefined) {
            center = box.getCenter();
        }
        const radius = points.reduce((acc, cur) => Math.max(acc, center.distanceToSquared(cur)), 0);
        return new Sphere(center, radius);
    }
    set center(v) {
        this._center = v.clone();
    }
    get center() {
        return this._center;
    }
    clone() {
        return new Sphere(this._center.clone(), this.radius);
    }
    applyMatrix4(m) {
        this.center.applyMatrix4(m);
        this.radius = this.radius * m.maxScaleOnAxis();
        return this;
    }
}
exports.default = Sphere;
