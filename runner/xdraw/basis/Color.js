"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
class Color {
    static rgb(r, g, b, a = 1) {
        const newC = new Color();
        newC.r = Math.max(Math.min(r, 0xff), 0);
        newC.g = Math.max(Math.min(g, 0xff), 0);
        newC.b = Math.max(Math.min(b, 0xff), 0);
        newC.a = Math.max(Math.min(a, 0xff), 0);
        return newC;
    }
    constructor(hex = 0) {
        hex = Math.floor(hex);
        if (hex >= 0x1000000) {
            this.r = ((hex >> 24) & 0xff) / 0xff;
            this.g = ((hex >> 16) & 0xff) / 0xff;
            this.b = ((hex >> 8) & 0xff) / 0xff;
            this.a = (hex & 0xff) / 0xff;
        }
        else {
            this.r = ((hex >> 16) & 0xff) / 0xff;
            this.g = ((hex >> 8) & 0xff) / 0xff;
            this.b = (hex & 0xff) / 0xff;
        }
    }
    clone() {
        const newC = new Color();
        newC.r = this.r;
        newC.g = this.g;
        newC.b = this.b;
        return newC;
    }
    multiplyScalar(intensity) {
        this.r *= intensity;
        this.g *= intensity;
        this.b *= intensity;
        return this;
    }
}
exports.default = Color;
