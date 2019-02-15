"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const EventSource_1 = require("../basis/EventSource");
;
;
let globalId = 0;
class MaterialProperties extends EventSource_1.default {
    constructor(options) {
        super();
        this.name = '';
        this.fog = true;
        this.lights = true;
        this.blending = 'Normal';
        this.side = 'Front';
        this.flatShading = false;
        this.vertexColors = 'None';
        this.opacity = 1;
        this.transparent = false;
        this.blendSrc = 'SrcAlpha';
        this.blendDst = '1-SrcAlpha';
        this.blendEquation = 'Add';
        this.depthFunc = 'LessEqual';
        this.depthTest = true;
        this.depthWrite = true;
        this.clippingPlanes = null;
        this.clipIntersection = false;
        this.clipShadows = false;
        this.shadowSide = null;
        this.colorWrite = true;
        this.precision = 'highp'; // override the renderer's default precision for this material
        this.polygonOffset = false;
        this.polygonOffsetFactor = 0;
        this.polygonOffsetUnits = 0;
        this.dithering = false;
        this.alphaTest = 0;
        this.premultipliedAlpha = false;
        this.visible = true;
        this.userData = {};
        this.needsUpdate = true;
        this.defines = {};
        this.linewidth = 1;
        this.wireframe = false;
        this.wireframeLinewidth = 1;
        this.wireframeLinecap = 'round';
        this.wireframeLinejoin = 'round';
        this.clipping = false; // set to use user-defined clipping planes
        this.skinning = false; // set to use skinning attribute streams
        this.morphTargets = false; // set to use morph targets
        this.morphNormals = false; // set to use morph normals
        this.extensions = {
            derivatives: false,
            fragDepth: false,
            drawBuffers: false,
            shaderTextureLOD: false // set to use shader texture LOD
        };
        this.index0AttributeName = undefined;
        this.uniformsNeedUpdate = false;
        this.sizeAttenuation = true;
        Object.assign(this, options);
        this.id = globalId++;
    }
    addAttribute(key, attribute) {
        this.shader.attributes[key] = attribute;
    }
    getAttribute(key) {
        return this.shader.uniforms.attributes[key];
    }
    addUniform(key, uniform) {
        this.shader.uniforms[key] = uniform;
    }
    refreshUniforms(program) {
        const uniforms = program.uniforms;
        Object.keys(this.shader.uniforms).forEach(key => {
            const value = this.shader.uniforms[key];
            uniforms.update(key, value);
        });
    }
}
// When rendered geometry doesn't include these attributes but the material does,
// use these default values in WebGL. This avoids errors when buffer data is missing.
MaterialProperties.defaultAttributeValues = {
    'color': [1, 1, 1],
    'uv': [0, 0],
    'uv2': [0, 0]
};
exports.MaterialProperties = MaterialProperties;
;
