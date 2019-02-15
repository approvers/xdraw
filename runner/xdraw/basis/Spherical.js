"use strict";
/**
 * @author bhouston / http://clara.io
 * @author WestLangley / http://github.com/WestLangley
 * @author RkEclair / https://github.com/RkEclair
 *
 * Ref: https://en.wikipedia.org/wiki/Spherical_coordinate_system
 *
 * The polar angle (phi) is measured from the positive y-axis. The positive y-axis is up.
 * The azimuthal angle (theta) is measured from the positive z-axiz.
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Spherical {
    constructor(radius = 1.0, phi = 0, theta = 0) {
        this.radius = radius;
        this.phi = phi;
        this.theta = theta;
    }
    static fromVector3(v) {
        return Spherical.fromCartesianCoords(v.x, v.y, v.z);
    }
    static fromCartesianCoords(x, y, z) {
        const radius = Math.sqrt(x * x + y * y + z * z);
        if (radius === 0) {
            return new Spherical(0, 0, 0);
        }
        return new Spherical(radius, Math.acos(Math.min(Math.max(y / radius, -1), 1)), Math.atan2(x, z));
    }
    clone() {
        return new Spherical(this.radius, this.phi, this.theta);
    }
    // restrict phi to be between EPS and PI-EPS
    makeSafe() {
        const EPS = 0.000001;
        this.phi = Math.max(EPS, Math.min(Math.PI - EPS, this.phi));
        return this;
    }
}
exports.default = Spherical;
