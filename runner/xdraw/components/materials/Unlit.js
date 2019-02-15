"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../basis/Color");
const Material_1 = require("./Material");
class Unlit {
    constructor(options) {
        const props = new Material_1.MaterialProperties(options || {
            specularColor: new Color_1.default(0xffffff),
            maps: {
                lightMap: { textures: [], intensity: 1.0 },
                aoMap: { textures: [], intensity: 1.0 },
                specularMap: {
                    textures: [],
                    combine: 'Multiply',
                    reflectivity: 1,
                    refractionRatio: 0.98,
                },
                alphaMap: { textures: [] },
                envMap: { textures: [] },
            },
            wireframe: false,
            wireframeLinewidth: 1,
            wireframeLinecap: 'round',
            wireframeLinejoin: 'round',
            skinning: false,
            morphTargets: false,
            lights: false,
        });
        Object.assign(this.props, props);
    }
    clone() {
        const newM = new Unlit(new Material_1.MaterialProperties({}));
        newM.props.specularColor = this.props.specularColor.clone();
        newM.props.maps = this.props.maps; // TODO: make it deep copy
        newM.props.wireframe = this.props.wireframe;
        newM.props.wireframeLinewidth = this.props.wireframeLinewidth;
        newM.props.wireframeLinecap = this.props.wireframeLinecap;
        newM.props.wireframeLinejoin = this.props.wireframeLinejoin;
        newM.props.skinning = this.props.skinning;
        newM.props.morphTargets = this.props.morphTargets;
    }
    toJSON() {
        throw new Error('Not implemented');
    }
}
exports.default = Unlit;
