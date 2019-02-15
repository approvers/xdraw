"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../basis/Color");
;
class Lines extends Material {
    constructor(options) {
        super(options);
        this.color = new Color_1.default(0xffffff);
        this.linewidth = 1;
        this.linecap = 'round';
        this.linejoin = 'round';
        this.lights = false;
        Object.assign(this, options);
    }
    clone() {
        return new Lines(Object.assign({}, this));
    }
    toJSON() {
        throw new Error('Not implemented');
    }
}
exports.default = Lines;
class LineSegments extends Lines {
}
exports.LineSegments = LineSegments;
class LineLoop extends Lines {
}
exports.LineLoop = LineLoop;
