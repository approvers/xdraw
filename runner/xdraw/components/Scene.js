"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const EventSource_1 = require("../basis/EventSource");
const Color_1 = require("../basis/Color");
class Scene extends EventSource_1.default {
    constructor() {
        super(...arguments);
        this.name = '';
    }
    dispose() {
        this.dispatchEvent({ type: 'dispose' });
    }
}
exports.default = Scene;
class Fog {
    constructor(color, near = 1, far = 1000) {
        this.near = near;
        this.far = far;
        this.name = '';
        this.color = new Color_1.default(color);
    }
}
exports.Fog = Fog;
class FogExp2 extends Fog {
    constructor(color, density) {
        super(color);
        this.density = density;
    }
}
exports.FogExp2 = FogExp2;
