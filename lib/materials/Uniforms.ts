export default class Uniforms {
  constructor(uniforms: any) {
    (Object as any).assign(this, uniforms);
  }

  clone(): Uniforms {
    const dst: any = {};

    for (const u in this) {
      dst[u] = {};

      for (const p in this[u]) {
        const property = this[u][p] as any;

        if (property.clone !== undefined) {
          dst[u][p] = property.clone();
        } else if (Array.isArray(property)) {
          dst[u][p] = property.slice() as any;
        } else {
          dst[u][p] = property;
        }
      }
    }

    dst.clone = this.clone;
    dst.mergeUniforms = this.mergeUniforms;

    return dst as Uniforms;
  }
  mergeUniforms(uniforms: Uniforms[]) {
    const merged = {};

    for (let u = 0; u < uniforms.length; u++) {
      const tmp = uniforms[u].clone();

      for (const p in tmp) {
        merged[p] = tmp[p];
      }
    }

    return merged;
  }
}
