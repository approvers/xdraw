/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  static rgb(r: number, g: number, b: number, a: number = 1) {
    const newC = new Color();
    newC.r = Math.max(Math.min(r, 0xff), 0);
    newC.g = Math.max(Math.min(g, 0xff), 0);
    newC.b = Math.max(Math.min(b, 0xff), 0);
    newC.a = Math.max(Math.min(a, 0xff), 0);
    return newC;
  }

  constructor(hex: number = 0) {
    hex = Math.floor(hex);
    if (hex >= 0x1000000) {
      this.r = ((hex >> 24) & 0xff) / 0xff;
      this.g = ((hex >> 16) & 0xff) / 0xff;
      this.b = ((hex >> 8) & 0xff) / 0xff;
      this.a = (hex & 0xff) / 0xff;
    } else {
      this.r = ((hex >> 16) & 0xff) / 0xff;
      this.g = ((hex >> 8) & 0xff) / 0xff;
      this.b = (hex & 0xff) / 0xff;
      this.a = 1;
    }
  }

  clone() {
    const newC = new Color();
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
