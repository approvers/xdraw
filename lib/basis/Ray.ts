import Box3 from "./Box3";
import Matrix4 from "./Matrix4";
import Sphere from "./Sphere";
import Triangle from "./Triangle";
import Vector3 from "./Vector3";

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class Ray {
  constructor(
    public origin = new Vector3(),
    public direction = new Vector3()
  ) {}

  clone() {
    return new Ray(this.origin.clone(), this.direction.clone());
  }

  applyMatrix4(m: Matrix4) {
    this.origin.applyMatrix4(m);
    this.direction.affineTransform(m);
    return this;
  }

  at(t: number) {
    return this.direction
      .clone()
      .multiplyScalar(t)
      .add(this.origin);
  }

  intersectedPointWithBox(box: Box3) {
    let txmin, txmax, tymin, tymax, tzmin, tzmax;

    const invdirx = 1 / this.direction.x,
      invdiry = 1 / this.direction.y,
      invdirz = 1 / this.direction.z;

    const origin = this.origin;

    if (invdirx >= 0) {
      txmin = (box.min.x - origin.x) * invdirx;
      txmax = (box.max.x - origin.x) * invdirx;
    } else {
      txmin = (box.max.x - origin.x) * invdirx;
      txmax = (box.min.x - origin.x) * invdirx;
    }

    if (invdiry >= 0) {
      tymin = (box.min.y - origin.y) * invdiry;
      tymax = (box.max.y - origin.y) * invdiry;
    } else {
      tymin = (box.max.y - origin.y) * invdiry;
      tymax = (box.min.y - origin.y) * invdiry;
    }

    if (txmin > tymax || tymin > txmax) return null;

    if (tymin > txmin || Number.isNaN(txmin)) txmin = tymin;

    if (tymax < txmax || Number.isNaN(txmax)) txmax = tymax;

    if (invdirz >= 0) {
      tzmin = (box.min.z - origin.z) * invdirz;
      tzmax = (box.max.z - origin.z) * invdirz;
    } else {
      tzmin = (box.max.z - origin.z) * invdirz;
      tzmax = (box.min.z - origin.z) * invdirz;
    }

    if (txmin > tzmax || tzmin > txmax) return null;

    if (tzmin > txmin || Number.isNaN(txmin)) txmin = tzmin;

    if (tzmax < txmax || Number.isNaN(txmax)) txmax = tzmax;

    if (txmax < 0) return null;

    return this.at(txmin >= 0 ? txmin : txmax);
  }

  intersectedPointWithTriangle(f: Triangle, cullBackface = false) {
    const edge1 = f.b.clone().sub(f.a);
    const edge2 = f.c.clone().sub(f.a);
    const normal = edge1.clone().cross(edge2);

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
    let DdN = this.direction.dot(normal),
      sign = 1;
    if (DdN < 0) {
      sign = -1;
      DdN = -DdN;
    } else if (DdN > 0 && cullBackface) {
      return null;
    } else {
      return null;
    }

    const diff = this.origin.clone().sub(f.a);
    const DdQxE2 = sign * this.direction.dot(diff.clone().cross(edge2));

    // b1 < 0, no intersection
    if (DdQxE2 < 0) {
      return null;
    }

    const DdE1xQ = sign * this.direction.dot(edge1.cross(diff));

    // b2 < 0, no intersection
    if (DdE1xQ < 0) {
      return null;
    }

    // b1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }

    // Line intersects triangle, check if ray does.
    const QdN = -sign * diff.dot(normal);

    // t < 0, no intersection
    if (QdN < 0) {
      return null;
    }

    // Ray intersects triangle.
    return this.at(QdN / DdN);
  }

  intersectsWithBox(box: Box3) {
    return this.intersectedPointWithBox(box) !== null;
  }

  intersectsWithSphere(sphere: Sphere) {
    return this.distanceSqToPoint(sphere.center) <= Math.pow(sphere.radius, 2);
  }

  intersectsWithTriangle(f: Triangle, cullBackface = false) {
    return this.intersectedPointWithTriangle(f, cullBackface) !== null;
  }

  distanceSqToPoint(p: Vector3) {
    const dist = p
      .clone()
      .sub(this.origin)
      .dot(this.direction);
    if (dist < 0) {
      return this.origin.distanceToSquared(p);
    }
    return this.direction
      .clone()
      .multiplyScalar(dist)
      .add(this.origin)
      .distanceToSquared(p);
  }
}
