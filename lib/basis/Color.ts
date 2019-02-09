/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class Color {
  r: number;
  g: number;
  b: number;

  constructor(hex: number = 0) {
    hex = Math.floor(hex);
    this.r = ((hex >> 16) & 255) / 255;
    this.g = ((hex >> 8) & 255) / 255;
    this.b = (hex & 255) / 255;
  }

  clone() {
    const newC = new Color(0);
    newC.r = this.r;
    newC.g = this.g;
    newC.b = this.b;
    return newC;
  }

  multiplyScalar(intensity: number) {
    this.r *= intensity;
    this.g *= intensity;
    this.b *= intensity;
    return this;
  }
}
