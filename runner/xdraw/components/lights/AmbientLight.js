"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../../basis/Color");
const Components_1 = require("../../basis/Components");
const Texture_1 = require("../../basis/textures/Texture");
const AmbientLight = (color = new Color_1.default(0xffffff), intensity = 1.0) => (store, _transform) => {
    if (!store.hasBind('ambientlight.color')) {
        store.addBind('ambientlight.color', color)
            .addBind('ambientlight.intensity', intensity, Components_1.rangeClamper(0, 1))
            .addBind('ambientlight.shadow', false)
            .addBind('ambientlight.shadow.bias', 0, Components_1.rangeClamper(0, 1))
            .addBind('ambientlight.shadow.radius', 1)
            .addBind('ambientlight.shadow.map', new Texture_1.default);
    }
    const self = store.getBindValues('ambientlight.');
    store.set('lights', {
        shine(state, _cache, _viewMatrix) {
            const ambient = state.ambient;
            ambient[0] += self.color.r * self.intensity;
            ambient[1] += self.color.g * self.intensity;
            ambient[2] += self.color.b * self.intensity;
        }
    });
    return store;
};
exports.default = AmbientLight;
