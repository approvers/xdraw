"use strict";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Light_1 = require("../Light");
const Color_1 = require("../../basis/Color");
const Transform_1 = require("../../basis/Transform");
const Vector3_1 = require("../../basis/Vector3");
class HemisphereLight extends Light_1.default {
    constructor(skyColor, groundColor, intensity) {
        super(skyColor, intensity);
        this.groundColor = groundColor;
        this.transform.position = Transform_1.default.up();
        this.transform.updateMatrix();
    }
    generateUniform() {
        return {
            direction: new Vector3_1.default(),
            skyColor: new Color_1.default(),
            groundColor: new Color_1.default()
        };
    }
    shine(state, cache, viewMatrix) {
        const uniforms = cache.get(this);
        uniforms.direction.setFromMatrixPosition(this.transform.matrixWorld);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.direction.normalize();
        uniforms.skyColor = this.color.clone().multiplyScalar(this.intensity);
        uniforms.groundColor = this.groundColor.clone().multiplyScalar(this.intensity);
        state.hemi.push(uniforms);
    }
}
exports.default = HemisphereLight;
