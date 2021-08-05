/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Box3 from "./Box3";
import Matrix4 from "./Matrix4";
import Sphere from "./Sphere";
import Triangle from "./Triangle";
import Vector3 from "./Vector3";

export default class Ray {
  constructor(
    public origin = new Vector3(),
    public direction = new Vector3(),
    public maxDistance = Infinity,
  ) {}

  clone() {
    return new Ray(
      this.origin.clone(),
      this.direction.clone(),
      this.maxDistance,
    );
  }

  applyMatrix4(m: Matrix4) {
    this.origin.applyMatrix4(m);
    this.direction.affineTransform(m);
    return this;
  }

  at(t: number) {
    return this.direction.clone().multiplyScalar(t).add(this.origin);
  }

  intersectedPointWithBox(box: Box3) {
    let txmin: number,
      txmax: number,
      tymin: number,
      tymax: number,
      tzmin: number,
      tzmax: number;

    const invdirx = 1 / this.direction.x,
      invdiry = 1 / this.direction.y,
      invdirz = 1 / this.direction.z;

    const { origin } = this;

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

    if (txmin > tymax || tymin > txmax) {
      return null;
    }

    if (tymin > txmin || Number.isNaN(txmin)) {
      txmin = tymin;
    }

    if (tymax < txmax || Number.isNaN(txmax)) {
      txmax = tymax;
    }

    if (invdirz >= 0) {
      tzmin = (box.min.z - origin.z) * invdirz;
      tzmax = (box.max.z - origin.z) * invdirz;
    } else {
      tzmin = (box.max.z - origin.z) * invdirz;
      tzmax = (box.min.z - origin.z) * invdirz;
    }

    if (txmin > tzmax || tzmin > txmax) {
      return null;
    }

    if (tzmin > txmin || Number.isNaN(txmin)) {
      txmin = tzmin;
    }

    if (tzmax < txmax || Number.isNaN(txmax)) {
      txmax = tzmax;
    }

    if (txmax < 0) {
      return null;
    }

    return this.at(txmin >= 0 ? txmin : txmax);
  }

  intersectedPointWithTriangle(f: Triangle, cullBackface = false) {
    const edge1 = f.b.sub(f.a);
    const edge2 = f.c.sub(f.a);
    const normal = edge1.clone().cross(edge2);

    /*
     * Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
     * E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
     *   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
     *   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
     *   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
     */
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

    const diff = this.origin.sub(f.a);
    const DdQxE2 = sign * this.direction.dot(diff.clone().cross(edge2));

    // B1 < 0, no intersection
    if (DdQxE2 < 0) {
      return null;
    }

    const DdE1xQ = sign * this.direction.dot(edge1.cross(diff));

    // B2 < 0, no intersection
    if (DdE1xQ < 0) {
      return null;
    }

    // B1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }

    // Line intersects triangle, check if ray does.
    const QdN = -sign * diff.dot(normal);

    // T < 0, no intersection
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
    return this.distanceSqToPoint(sphere.center) <= sphere.radius ** 2;
  }

  intersectsWithTriangle(f: Triangle, cullBackface = false) {
    return this.intersectedPointWithTriangle(f, cullBackface) !== null;
  }

  distanceSqToPoint(p: Vector3) {
    const dist = p.sub(this.origin).dot(this.direction);
    if (dist < 0) {
      return this.origin.distanceToSquared(p);
    }
    return this.direction
      .clone()
      .multiplyScalar(dist)
      .add(this.origin)
      .distanceToSquared(p);
  }

  private segCenter = new Vector3();

  private segDir = new Vector3();

  private diff = new Vector3();

  distanceSqToSegment(
    vStart: Vector3,
    vEnd: Vector3,
    interRay?: Vector3,
    interSegment?: Vector3,
  ): any {

    /*
     * From
     * http://www.geometrictools.com/GTEngine/Include/Mathematics/GteDistRaySegment.h
     * It returns the min distance between the ray and the segment
     * defined by vStart and vEnd
     * It can also set two optional targets :
     * - The closest point on the ray
     * - The closest point on the segment
     */

    this.segCenter = vStart.add(vEnd).multiplyScalar(0.5);
    this.segDir = vEnd.sub(vStart).normalize();
    this.diff = this.origin.sub(this.segCenter);

    const segExtent = vStart.distanceTo(vEnd) * 0.5;
    const a01 = -this.direction.dot(this.segDir);
    const b0 = this.diff.dot(this.direction);
    const b1 = -this.diff.dot(this.segDir);
    const c = this.diff.lengthSq();
    const det = Math.abs(1 - a01 * a01);
    let s0: number, s1: number, sqrDist: number, extDet: number;

    if (det > 0) {
      // The ray and segment are not parallel.

      s0 = a01 * b1 - b0;
      s1 = a01 * b0 - b1;
      extDet = segExtent * det;

      if (s0 >= 0) {
        if (s1 >= -extDet) {
          if (s1 <= extDet) {

            /*
             * Region 0
             * Minimum at interior points of ray and segment.
             */

            const invDet = 1 / det;
            s0 *= invDet;
            s1 *= invDet;
            sqrDist =
              s0 * (s0 + a01 * s1 + 2 * b0) + s1 * (a01 * s0 + s1 + 2 * b1) + c;
          } else {
            // Region 1

            s1 = segExtent;
            s0 = Math.max(0, -(a01 * s1 + b0));
            sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
          }
        } else {
          // Region 5

          s1 = -segExtent;
          s0 = Math.max(0, -(a01 * s1 + b0));
          sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
        }
      } else if (s1 <= -extDet) {
        // Region 4

        s0 = Math.max(0, -(-a01 * segExtent + b0));
        s1 =
          s0 > 0 ? -segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      } else if (s1 <= extDet) {
        // Region 3

        s0 = 0;
        s1 = Math.min(Math.max(-segExtent, -b1), segExtent);
        sqrDist = s1 * (s1 + 2 * b1) + c;
      } else {
        // Region 2

        s0 = Math.max(0, -(a01 * segExtent + b0));
        s1 =
          s0 > 0 ? segExtent : Math.min(Math.max(-segExtent, -b1), segExtent);
        sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
      }
    } else {
      // Ray and segment are parallel.

      s1 = a01 > 0 ? -segExtent : segExtent;
      s0 = Math.max(0, -(a01 * s1 + b0));
      sqrDist = -s0 * s0 + s1 * (s1 + 2 * b1) + c;
    }

    if (interRay !== undefined && interRay !== null) {
      interRay = this.direction.clone().multiplyScalar(s0).add(this.origin);
    }

    if (interSegment !== undefined && interSegment !== null) {
      interSegment = this.segDir.clone().multiplyScalar(s1).add(this.segCenter);
    }

    return sqrDist;
  }
}
