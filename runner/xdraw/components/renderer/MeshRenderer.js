"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const ConceptualizatedWebGL_1 = require("./webgl/ConceptualizatedWebGL");
const MeshRenderer = (canvas, backgroundSetter) => {
    const ctx = canvas.getContext('webgl');
    if (ctx === null) {
        throw new Error('The browser is not supported webgl.');
    }
    const gl = ConceptualizatedWebGL_1.default(ctx);
    backgroundSetter(gl.clear);
    return (store, transform) => {
        gl.clear.do();
        return store;
    };
};
exports.default = MeshRenderer;
