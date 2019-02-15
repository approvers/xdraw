"use strict";
/**
 * @author Mugen87 / https://github.com/Mugen87
 *
 * Ref: https://en.wikipedia.org/wiki/Cylindrical_coordinate_system
 *
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Cylindrical {
    constructor(radius = 1.0, theta = 0, y = 0) {
        this.radius = radius;
        this.theta = theta;
        this.y = y;
    }
    clone() {
        return new Cylindrical(this.radius, this.theta, this.y);
    }
    static fromVector3(v) {
        return Cylindrical.fromCartesianCoords(v.x, v.y, v.z);
    }
    static fromCartesianCoords(x, y, z) {
        return new Cylindrical(Math.sqrt(x * x + z * z), Math.atan2(x, z), y);
    }
}
exports.default = Cylindrical;
