import BufferAttribute from './BufferAttribute';
import Face3 from './Face3';
import Ray from './Ray';
import Transform from './Transform';
import Triangle from './Triangle';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Material from '../materials/Material';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export interface RaycastIntersection {
  distance: number;
  distanceToRay?: number;
  point: Vector3;
  index?: number;
  object: Transform;
  uv?: Vector2;
  face?: Face3;
  faceIndex: number;
}

export default class Raycaster {
  ray: Ray;
  linePrecision: number;
  constructor(
      origin: Vector3, direction: Vector3, public near = 0,
      public far = Infinity) {
    this.ray = new Ray(origin, direction);
  }

  checkBufferMeshIntersection(
      object: Transform, material: Material, position: BufferAttribute,
      uvs: BufferAttribute, aIndex: number, bIndex: number, cIndex: number,
      intersectionPoint: Vector3) {
    const vA = Vector3.fromBufferAttribute(position, aIndex);
    const vB = Vector3.fromBufferAttribute(position, bIndex);
    const vC = Vector3.fromBufferAttribute(position, cIndex);
    const f = new Triangle(vA, vB, vC);

    if (material.props.propsside === 'Back') {
      if (!this.ray.intersectsWithTriangle(f, true)) return null;
    } else {
      if (!this.ray.intersectsWithTriangle(f, material.props.propsside !== 'Double'))
        return null;
    }

    const intersectionPointWorld =
        intersectionPoint.clone().applyMatrix4(object.matrixWorld);
    const distance = this.ray.origin.distanceTo(intersectionPointWorld);

    const uvA = Vector2.fromBufferAttribute(uvs, aIndex);
    const uvB = Vector2.fromBufferAttribute(uvs, bIndex);
    const uvC = Vector2.fromBufferAttribute(uvs, cIndex);
    if (distance < this.near || distance > this.far) return null;

    const uv = f.uv(intersectionPoint, [uvA, uvB, uvC]),
          face = new Face3(aIndex, bIndex, cIndex);
    face.normal = f.normal();
    return {
      distance: distance,
      point: intersectionPointWorld.clone(),
      object: object,
      uv,
      face,
      faceIndex: -1
    };
  }
}
