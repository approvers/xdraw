"use strict";
/**
 * @author abelnation / http://github.com/abelnation
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Light_1 = require("../Light");
const Color_1 = require("../../basis/Color");
const Vector3_1 = require("../../basis/Vector3");
const Vector2_1 = require("../../basis/Vector2");
const Matrix4_1 = require("../../basis/Matrix4");
class RectAreaLight extends Light_1.default {
    constructor(color, intensity, width = 10, height = 10) {
        super(color, intensity);
        this.width = width;
        this.height = height;
    }
    generateUniform() {
        return {
            color: new Color_1.default(),
            position: new Vector3_1.default(),
            halfWidth: new Vector3_1.default(),
            halfHeight: new Vector3_1.default(),
            shadow: false,
            shadowBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Vector2_1.default(),
            shadowCameraNear: 1,
            shadowCameraFar: 1000
        };
    }
    shine(state, cache, viewMatrix) {
        const uniforms = cache.get(this);
        // (a) intensity is the total visible this emitted
        //uniforms.color.copy( color ).multiplyScalar( intensity / ( this.width * this.height * Math.PI ) );
        // (b) intensity is the brightness of the this
        uniforms.color = this.color.clone().multiplyScalar(this.intensity);
        uniforms.position.setFromMatrixPosition(this.transform.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        // extract local rotation of this to derive width/height half vectors
        let matrix42 = Matrix4_1.default.identity();
        let matrix4 = this.transform.matrixWorld.clone();
        matrix4 = viewMatrix.multiply(matrix4);
        matrix42 = Matrix4_1.default.extractRotation(matrix4);
        uniforms.halfWidth.set(this.width * 0.5, 0.0, 0.0);
        uniforms.halfHeight.set(0.0, this.height * 0.5, 0.0);
        uniforms.halfWidth.applyMatrix4(matrix42);
        uniforms.halfHeight.applyMatrix4(matrix42);
        // TODO (abelnation): RectAreaLight distance?
        // uniforms.distance = distance;
        state.rectArea.push(uniforms);
    }
}
exports.default = RectAreaLight;
