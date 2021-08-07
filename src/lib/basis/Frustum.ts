/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://clara.io
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Box3 from "./Box3";
import Matrix4 from "./Matrix4";
import Plane from "./Plane";
import Sphere from "./Sphere";
import Vector3 from "./Vector3";

export default class Frustum {
  constructor(public planes: [Plane, Plane, Plane, Plane, Plane, Plane]) {}

  clone(): Frustum {
    return new Frustum([...this.planes]);
  }

  setFromMatrix(m: Matrix4): Frustum {
    const { planes } = this;
    const me = m.elements;

    planes[0]
      .setComponents(
        me[3] - me[0],
        me[7] - me[4],
        me[11] - me[8],
        me[15] - me[12],
      )
      .normalize();
    planes[1]
      .setComponents(
        me[3] + me[0],
        me[7] + me[4],
        me[11] + me[8],
        me[15] + me[12],
      )
      .normalize();
    planes[2]
      .setComponents(
        me[3] + me[1],
        me[7] + me[5],
        me[11] + me[9],
        me[15] + me[13],
      )
      .normalize();
    planes[3]
      .setComponents(
        me[3] - me[1],
        me[7] - me[5],
        me[11] - me[9],
        me[15] - me[13],
      )
      .normalize();
    planes[4]
      .setComponents(
        me[3] - me[2],
        me[7] - me[6],
        me[11] - me[10],
        me[15] - me[14],
      )
      .normalize();
    planes[5]
      .setComponents(
        me[3] + me[2],
        me[7] + me[6],
        me[11] + me[10],
        me[15] + me[14],
      )
      .normalize();

    return this;
  }

  /*
   *IntersectsMesh(transform: Transform) {
   *  const sphere = transform.boundingSphere ||
   *transform.computeBoundingSphere();
   *  sphere.applyMatrix4(transform.matrixWorld);
   *  return this.intersectsSphere(sphere);
   *}
   *
   *intersectsSprite(sprite: Sprite) {
   *  const sphere = new Sphere(new Vector3(0, 0, 0), Math.sqrt(2) / 2);
   *  sphere.applyMatrix4(sprite.transform.matrixWorld);
   *  return this.intersectsSphere(sphere);
   *}
   */

  intersectsSphere(sphere: Sphere): boolean {
    const { center } = sphere;
    const negRadius = -sphere.radius;

    for (const plane of this.planes) {
      const distance = plane.distanceToPoint(center);
      if (distance < negRadius) {
        return false;
      }
    }
    return true;
  }

  intersectsBox(box: Box3): boolean {
    const p = new Vector3();

    const { planes } = this;

    for (const plane of planes) {
      // Corner at max distance
      p.x = plane.normal.x > 0 ? box.max.x : box.min.x;
      p.y = plane.normal.y > 0 ? box.max.y : box.min.y;
      p.z = plane.normal.z > 0 ? box.max.z : box.min.z;

      if (plane.distanceToPoint(p) < 0) {
        return false;
      }
    }

    return true;
  }

  containsPoint(point: Vector3): boolean {
    return !this.planes.some((e) => e.distanceToPoint(point) < 0);
  }
}
