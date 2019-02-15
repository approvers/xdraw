"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const WebGLClears_1 = require("./WebGLClears");
const ConceptualizatedWebGL = (ctx) => {
    return {
        clear: new WebGLClears_1.default(ctx)
    };
};
exports.default = ConceptualizatedWebGL;
