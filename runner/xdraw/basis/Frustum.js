"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author bhouston / http://clara.io
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Plane_1 = require("./Plane");
const Vector3_1 = require("./Vector3");
class Frustum {
    constructor(p0 = new Plane_1.default(), p1 = new Plane_1.default(), p2 = new Plane_1.default(), p3 = new Plane_1.default(), p4 = new Plane_1.default(), p5 = new Plane_1.default()) {
        this.planes = [
            p0.clone(), p1.clone(), p2.clone(), p3.clone(), p4.clone(), p5.clone()
        ];
    }
    clone() {
        return new (Frustum.apply(null, this.planes))();
    }
    setFromMatrix(m) {
        const planes = this.planes;
        const me = m.elements;
        const me0 = me[0], me1 = me[1], me2 = me[2], me3 = me[3];
        const me4 = me[4], me5 = me[5], me6 = me[6], me7 = me[7];
        const me8 = me[8], me9 = me[9], me10 = me[10], me11 = me[11];
        const me12 = me[12], me13 = me[13], me14 = me[14], me15 = me[15];
        planes[0]
            .setComponents(me3 - me0, me7 - me4, me11 - me8, me15 - me12)
            .normalize();
        planes[1]
            .setComponents(me3 + me0, me7 + me4, me11 + me8, me15 + me12)
            .normalize();
        planes[2]
            .setComponents(me3 + me1, me7 + me5, me11 + me9, me15 + me13)
            .normalize();
        planes[3]
            .setComponents(me3 - me1, me7 - me5, me11 - me9, me15 - me13)
            .normalize();
        planes[4]
            .setComponents(me3 - me2, me7 - me6, me11 - me10, me15 - me14)
            .normalize();
        planes[5]
            .setComponents(me3 + me2, me7 + me6, me11 + me10, me15 + me14)
            .normalize();
        return this;
    }
    /*
    intersectsMesh(transform: Transform) {
      const sphere = transform.boundingSphere || transform.computeBoundingSphere();
      sphere.applyMatrix4(transform.matrixWorld);
      return this.intersectsSphere(sphere);
    }
  
    intersectsSprite(sprite: Sprite) {
      const sphere = new Sphere(new Vector3(0, 0, 0), Math.sqrt(2) / 2);
      sphere.applyMatrix4(sprite.transform.matrixWorld);
      return this.intersectsSphere(sphere);
    }
    */
    intersectsSphere(sphere) {
        const center = sphere.center;
        const negRadius = -sphere.radius;
        for (const plane of this.planes) {
            const distance = plane.distanceToPoint(center);
            if (distance < negRadius) {
                return false;
            }
        }
        return true;
    }
    intersectsBox(box) {
        const p = new Vector3_1.default();
        const planes = this.planes;
        for (const plane of planes) {
            // corner at max distance
            p.x = plane.normal.x > 0 ? box.max.x : box.min.x;
            p.y = plane.normal.y > 0 ? box.max.y : box.min.y;
            p.z = plane.normal.z > 0 ? box.max.z : box.min.z;
            if (plane.distanceToPoint(p) < 0) {
                return false;
            }
        }
        return true;
    }
    containsPoint(point) {
        return !this.planes.some((e) => e.distanceToPoint(point) < 0);
    }
}
exports.default = Frustum;
