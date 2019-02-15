"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../basis/Color");
;
class Points extends Material {
    constructor(options) {
        super(options);
        this.color = new Color_1.default(0xffffff);
        this.size = 1;
        this.sizeAttenuation = true;
        this.morphTargets = false;
        this.lights = false;
        Object.assign(this, options);
    }
    clone() {
        return new Points(Object.assign({}, this));
    }
    toJSON() {
        throw new Error('Not implemented');
    }
}
exports.default = Points;
