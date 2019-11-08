import {XStore} from '../../basis/Components';
import Ray from '../../basis/Ray';
import Vector3 from '../../basis/Vector3';
import {RaycastIntersection} from '../physics/PhysicsUtils';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author MikuroXina / https://github.com/MikuroXina
 */

const raycast = (ray: Ray, intersects: RaycastIntersection[]) => (
    store: XStore) => {
  const precision = ray.linePrecision;

  const mesh = this.mesh;
  const matrixWorld = this.transform.matrixWorld;

  // Checking boundingSphere distance to ray

  if (mesh.boundingSphere === null) mesh.computeBoundingSphere();

  this.sphere = mesh.boundingSphere.clone();
  this.sphere.applyMatrix4(matrixWorld);
  this.sphere.radius += precision;

  if (ray.intersectsWithSphere(this.sphere) === false) return;

  //

  this.inverseMatrix.inverse(matrixWorld);
  this.ray = ray.clone().applyMatrix4(this.inverseMatrix);

  const localPrecision = precision /
      ((this.transform.scale.x + this.transform.scale.y +
        this.transform.scale.z) /
       3);
  const localPrecisionSq = localPrecision * localPrecision;

  let vStart = new Vector3();
  let vEnd = new Vector3();
  let interSegment = new Vector3();
  let interRay = new Vector3();
  const step = (0 < this.lineSegments) ? 2 : 1;

  if (store.has('mesh')) {
    const index = mesh.index;
    const attributes = mesh.attributes;
    const positions = attributes.position;

    if (index !== null) {
      const indices = index.array;

      for (let i = 0, l = indices.length - 1; i < l; i += step) {
        const a = indices[i];
        const b = indices[i + 1];

        vStart = Vector3.fromBufferAttribute(positions, a * 3);
        vEnd = Vector3.fromBufferAttribute(positions, b * 3);

        const distSq =
            this.ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

        if (distSq > localPrecisionSq) continue;

        interRay.applyMatrix4(
            this.transform.matrixWorld);  // Move back to world space for
                                          // distance calculation

        const distance = ray.origin.distanceTo(interRay);

        if (distance < ray.near || distance > ray.far) continue;

        intersects.push({

          distance: distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
          index: i,
          faceIndex: -1,
          object: this.transform

        });
      }

    } else {
      for (let i = 0, l = positions.length / 3 - 1; i < l; i += step) {
        vStart = Vector3.fromBufferAttribute(positions, 3 * i);
        vEnd = Vector3.fromBufferAttribute(positions, 3 * i + 3);

        const distSq =
            this.ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

        if (distSq > localPrecisionSq) continue;

        interRay.applyMatrix4(
            this.transform.matrixWorld);  // Move back to world space for
                                          // distance calculation

        const distance = ray.origin.distanceTo(interRay);

        if (distance < ray.near || distance > ray.far) continue;

        intersects.push({

          distance: distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
          index: i,
          faceIndex: -1,
          object: this.transform

        });
      }
    }
  } else {
    const vertices = mesh.vertices;
    const nbVertices = vertices.length;

    for (let i = 0; i < nbVertices - 1; i += step) {
      const distSq = this.ray.distanceSqToSegment(
          vertices[i], vertices[i + 1], interRay, interSegment);

      if (distSq > localPrecisionSq) continue;

      interRay.applyMatrix4(
          this.transform.matrixWorld);  // Move back to world space for distance
                                        // calculation

      const distance = ray.origin.distanceTo(interRay);

      if (distance < ray.near || distance > ray.far) continue;

      intersects.push({

        distance: distance,
        // What do we want? intersection point on the ray or on the segment??
        // point: ray.at( distance ),
        point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
        index: i,
        faceIndex: -1,
        object: this.transform

      });
    }
  }
}