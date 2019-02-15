"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = require("../../basis/Vector2");
const Matrix4_1 = require("../../basis/Matrix4");
const Color_1 = require("../../basis/Color");
function packLight(store, params = {}) {
    store.set('lightShadow', Object.assign({ color: new Color_1.default, intensity: 1.0 }, params));
}
exports.packLight = packLight;
function packLightShadow(store, params = {}) {
    store.set('lightShadow', Object.assign({ bias: 0, radius: 1, mapSize: new Vector2_1.default(512, 512), matrix: new Matrix4_1.default() }, params));
}
exports.packLightShadow = packLightShadow;
