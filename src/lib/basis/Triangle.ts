import { Vector2 } from "./Vector2";
import { Vector3 } from "./Vector3";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export class Triangle {
  constructor(
    public a = new Vector3(),
    public b = new Vector3(),
    public c = new Vector3(),
  ) {}

  normal(): Vector3 {
    const sub = this.c.sub(this.b),
      v0 = this.a.sub(this.b);
    sub.cross(v0);
    const len = sub.lengthSq();
    if (len > 0) {
      return sub.multiplyScalar(1 / Math.sqrt(len));
    }
    return new Vector3();
  }

  barycoord(point: Vector3): Vector3 {
    const v0 = this.c.sub(this.a);
    const v1 = this.b.sub(this.a);
    const v2 = point.sub(this.a);

    const dot00 = v0.dot(v0);
    const dot01 = v0.dot(v1);
    const dot02 = v0.dot(v2);
    const dot11 = v1.dot(v1);
    const dot12 = v1.dot(v2);

    const denom = dot00 * dot11 - dot01 * dot01;

    // Collinear or singular triangle
    if (denom === 0) {
      /*
       * Arbitrary location outside of triangle?
       * not sure if this is the best idea, maybe should be returning undefined
       */
      return new Vector3(-2, -1, -1);
    }

    const invDenom = 1 / denom;
    const u = (dot11 * dot02 - dot01 * dot12) * invDenom;
    const v = (dot00 * dot12 - dot01 * dot02) * invDenom;

    // Barycentric coordinates must always sum to 1
    return new Vector3(1 - u - v, v, u);
  }

  uv(point: Vector3, uv: Vector2[]): Vector2 {
    const calced = new Vector2(0, 0),
      bary = this.barycoord(point);
    calced.add(uv[0].multiplyScalar(bary.x));
    calced.add(uv[1].multiplyScalar(bary.y));
    calced.add(uv[2].multiplyScalar(bary.z));
    return calced;
  }
}
