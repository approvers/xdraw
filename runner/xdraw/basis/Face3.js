"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("./Color");
const Vector3_1 = require("./Vector3");
/**
 * @author RkEclair / https://github.com/RkEclair
 */
class Face3 {
    constructor(a, b, c, normal = new Vector3_1.default(), color = new Color_1.default(0), materialIndex = 0) {
        this.a = a;
        this.b = b;
        this.c = c;
        this.normal = normal;
        this.color = color;
        this.materialIndex = materialIndex;
        this.vertexNormals = [];
        this.vertexColors = [];
    }
    clone() {
        return new Face3(this.a, this.b, this.c, this.normal.clone(), this.color.clone(), this.materialIndex);
    }
}
exports.default = Face3;
