"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Light_1 = require("../Light");
const Camera_1 = require("../../cameras/Camera");
const Color_1 = require("../../basis/Color");
const Vector3_1 = require("../../basis/Vector3");
const Vector2_1 = require("../../basis/Vector2");
class PointLightShadow extends Light_1.LightShadow {
    constructor() {
        super(new Camera_1.PersCamera(90, 1, 0.5, 500));
    }
}
exports.PointLightShadow = PointLightShadow;
class PointLight extends Light_1.default {
    constructor(color, intensity, distance = 0, decay = 1) {
        super(color, intensity);
        this.distance = distance;
        this.decay = decay;
        this.shadow = new PointLightShadow();
    }
    get power() {
        // intensity = power per solid angle.
        // ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
        return this.intensity * 4 * Math.PI;
    }
    set power(p) {
        // intensity = power per solid angle.
        // ref: equation (15) from https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
        this.intensity = p / (4 * Math.PI);
    }
    generateUniform() {
        return {
            position: new Vector3_1.default(),
            color: new Color_1.default(),
            distance: 0,
            decay: 0,
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
        uniforms.position.setFromMatrixPosition(this.transform.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        uniforms.color = this.color.clone().multiplyScalar(this.intensity);
        uniforms.distance = this.distance;
        uniforms.decay = this.decay;
        uniforms.shadow = this.castShadow;
        if (this.castShadow) {
            const shadow = this.shadow, camera = shadow.camera;
            uniforms.shadowBias = shadow.bias;
            uniforms.shadowRadius = shadow.radius;
            uniforms.shadowMapSize = shadow.mapSize;
            uniforms.shadowCameraNear = camera.near;
            uniforms.shadowCameraFar = camera.far;
        }
        state.point.push({
            uniforms,
            texture: this.shadow.map.texture,
            matrix: this.shadow.matrix
        });
    }
}
exports.default = PointLight;
