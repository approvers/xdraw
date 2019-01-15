export default class Uniforms {
  clone() {
    const dst = {};

    for (const u in this) {
      dst[u] = {};

      for (const p in this[u]) {
        const property = this[u][p] as any;

        if (property.clone !== undefined) {
          dst[u][p] = property.clone();
        } else if (Array.isArray(property)) {
          dst[u][p] = property.slice();
        } else {
          dst[u][p] = property;
        }
      }
    }

    return dst;
  }
  mergeUniforms(uniforms) {
    var merged = {};

    for (var u = 0; u < uniforms.length; u++) {
      var tmp = this.clone(uniforms[u]);

      for (var p in tmp) {
        merged[p] = tmp[p];
      }
    }

    return merged;
  }
}
