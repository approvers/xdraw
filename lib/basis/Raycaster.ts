import BufferAttribute from './BufferAttribute';
import Face3 from './Face3';
import Ray from './Ray';
import Transform from './Transform';
import Triangle from './Triangle';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Material from '../materials/Material';
import Camera, { PersCamera, OrthoCamera } from '../cameras/Camera';

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
    origin = new Vector3(), direction = new Vector3(), public near = 0,
    public far = Infinity) {
    this.ray = new Ray(origin, direction);
  }

  setFromCamera(coords: { x: number; y: number }, camera: Camera) {

    if (camera instanceof PersCamera) {
      this.ray.origin = Vector3.fromMatrixPosition(camera.transform.matrixWorld);
      this.ray.direction = new Vector3(coords.x, coords.y, 0.5).unproject(camera.transform).sub(this.ray.origin).normalize();
    } else if (camera instanceof OrthoCamera) {
      this.ray.origin = new Vector3(coords.x, coords.y, (camera.near + camera.far) / (camera.near - camera.far)).unproject(camera.transform); // set origin in plane of camera
      this.ray.direction = Transform.front.transformDirection(camera.transform.matrixWorld);
    } else {
      console.error('Raycaster: Unsupported camera.');
    }
  }

  intersectObject(object: XObject, recursive = false, optionalTarget: RaycastIntersection[] = [], sortByDistance = false) {
    const intersects = optionalTarget || [];

    if (recursive === false) {
      const t = object.transform;
      if (t.recieveRaycast === false || t.object.raycast === undefined) return [];
      const intersect: RaycastIntersection = t.object.raycast(this);
      if (Object.keys(intersect).length <= 0) return [];
      return [intersect];
    }

    object.transform.traverse((t: Transform) => {
      if (t.recieveRaycast === false || t.object.raycast === undefined) return;
      const intersect: RaycastIntersection = t.object.raycast(this);
      if (Object.keys(intersect).length <= 0) return;
      intersects.push(intersect);
    })

    if (sortByDistance) intersects.sort((a, b) => a.distance - b.distance);

    return intersects;
  }

  intersectObjects(objects: XObject[], recursive = false, optionalTarget: RaycastIntersection[] = [], sortByDistance = false) {
    const intersects = optionalTarget || [];

    objects.forEach(x =>
        this.intersectObject(x, recursive, intersects, sortByDistance)
    );

    if (sortByDistance) intersects.sort((a, b) => a.distance - b.distance);

    return intersects;
  }


  checkBufferMeshIntersection(
    object: Transform, material: Material, position: BufferAttribute,
    uvs: BufferAttribute, aIndex: number, bIndex: number, cIndex: number,
    intersectionPoint: Vector3) {
    const vA = Vector3.fromBufferAttribute(position, aIndex);
    const vB = Vector3.fromBufferAttribute(position, bIndex);
    const vC = Vector3.fromBufferAttribute(position, cIndex);
    const f = new Triangle(vA, vB, vC);

    if (material.props.side === 'Back') {
      if (!this.ray.intersectsWithTriangle(f, true)) return null;
    } else {
      if (!this.ray.intersectsWithTriangle(f, material.props.side !== 'Double'))
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
