/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Color {
  r: number;

  g: number;

  b: number;

  a: number;

  static rgb({
    r,
    g,
    b,
    a = 1,
  }: {
    r: number;
    g: number;
    b: number;
    a?: number;
  }): Color {
    const newC = new Color();
    newC.r = Math.max(Math.min(r, 0xff), 0);
    newC.g = Math.max(Math.min(g, 0xff), 0);
    newC.b = Math.max(Math.min(b, 0xff), 0);
    newC.a = Math.max(Math.min(a, 0xff), 0);
    return newC;
  }

  constructor(hex = 0) {
    const hexInt = Math.floor(hex);
    if (hex >= 0x1000000) {
      this.r = ((hexInt >> 24) & 0xff) / 0xff;
      this.g = ((hexInt >> 16) & 0xff) / 0xff;
      this.b = ((hexInt >> 8) & 0xff) / 0xff;
      this.a = (hexInt & 0xff) / 0xff;
    } else {
      this.r = ((hexInt >> 16) & 0xff) / 0xff;
      this.g = ((hexInt >> 8) & 0xff) / 0xff;
      this.b = (hexInt & 0xff) / 0xff;
      this.a = 1;
    }
  }

  clone(): Color {
    const newC = new Color();
    newC.r = this.r;
    newC.g = this.g;
    newC.b = this.b;
    return newC;
  }

  multiplyScalar(intensity: number): Color {
    this.r *= intensity;
    this.g *= intensity;
    this.b *= intensity;
    return this;
  }
}
