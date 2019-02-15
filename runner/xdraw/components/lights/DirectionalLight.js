"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Light_1 = require("../Light");
const Camera_1 = require("../../cameras/Camera");
const Transform_1 = require("../../basis/Transform");
const Color_1 = require("../../basis/Color");
const Vector3_1 = require("../../basis/Vector3");
const Vector2_1 = require("../../basis/Vector2");
class DirectionalLightShadow extends Light_1.LightShadow {
    constructor() {
        super(new Camera_1.OrthoCamera(-5, 5, 5, -5, 0.5, 500));
    }
}
exports.DirectionalLightShadow = DirectionalLightShadow;
class DirectionalLight extends Light_1.default {
    constructor(color, intensity) {
        super(color, intensity);
        this.shadow = new DirectionalLightShadow();
        this.transform.position = Transform_1.default.up();
        this.transform.updateMatrix();
    }
    clone() {
        const newL = new DirectionalLight(this.color, this.intensity);
        newL.target = this.target.object.clone().transform;
        newL.shadow = this.shadow.clone();
        return newL;
    }
    generateUniform() {
        return {
            direction: new Vector3_1.default(),
            color: new Color_1.default(),
            shadow: false,
            shadowBias: 0,
            shadowRadius: 1,
            shadowMapSize: new Vector2_1.default()
        };
    }
    shine(state, cache, viewMatrix) {
        const uniforms = cache.get(this);
        uniforms.color.copy(this.color).multiplyScalar(this.intensity);
        uniforms.direction.setFromMatrixPosition(this.transform.matrixWorld);
        const vec = Vector3_1.default.fromMatrixPosition(this.target.matrixWorld);
        uniforms.direction.sub(vec);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.shadow = this.castShadow;
        if (this.castShadow) {
            const shadow = this.shadow;
            uniforms.shadowBias = shadow.bias;
            uniforms.shadowRadius = shadow.radius;
            uniforms.shadowMapSize = shadow.mapSize;
        }
        state.directional.push({
            uniforms,
            texture: this.shadow.map.texture,
            matrix: this.shadow.matrix
        });
    }
}
exports.default = DirectionalLight;
