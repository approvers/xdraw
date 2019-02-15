"use strict";
/**
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Light_1 = require("../Light");
const Transform_1 = require("../../basis/Transform");
const Color_1 = require("../../basis/Color");
const Vector3_1 = require("../../basis/Vector3");
const Vector2_1 = require("../../basis/Vector2");
const Camera_1 = require("../../cameras/Camera");
class SpotLightShadow extends Light_1.LightShadow {
    constructor() {
        super(new Camera_1.PersCamera(50, 1, 0.5, 500));
    }
}
exports.SpotLightShadow = SpotLightShadow;
class SpotLight extends Light_1.default {
    constructor(color, intensity, distance = 0, angle = Math.PI / 3, penumbra = 0, decay = 1) {
        super(color, intensity);
        this.distance = distance;
        this.angle = angle;
        this.penumbra = penumbra;
        this.decay = decay;
        this.shadow = new SpotLightShadow();
        this.transform.position = Transform_1.default.up();
        this.transform.updateMatrix();
    }
    get power() {
        return this.intensity * Math.PI;
    }
    set power(p) {
        this.intensity = p / Math.PI;
    }
    generateUniform() {
        return {
            position: new Vector3_1.default(),
            direction: new Vector3_1.default(),
            color: new Color_1.default(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0,
            shadow: false,
            shadowBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Vector2_1.default()
        };
    }
    shine(state, cache, viewMatrix) {
        const uniforms = cache.get(this);
        uniforms.position.setFromMatrixPosition(this.transform.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);
        uniforms.color = this.color.clone().multiplyScalar(this.intensity);
        uniforms.distance = this.distance;
        uniforms.direction.setFromMatrixPosition(this.transform.matrixWorld);
        const vec = Vector3_1.default.fromMatrixPosition(this.target.matrixWorld);
        uniforms.direction.sub(vec);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.coneCos = Math.cos(this.angle);
        uniforms.penumbraCos = Math.cos(this.angle * (1 - this.penumbra));
        uniforms.decay = this.decay;
        uniforms.shadow = this.castShadow;
        if (this.castShadow) {
            const shadow = this.shadow;
            uniforms.shadowBias = shadow.bias;
            uniforms.shadowRadius = shadow.radius;
            uniforms.shadowMapSize = shadow.mapSize;
        }
        state.spot.push({
            uniforms,
            texture: this.shadow.map.texture,
            matrix: this.shadow.matrix
        });
    }
}
exports.default = SpotLight;
