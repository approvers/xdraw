/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferMesh from './BufferMesh';
import Lines from '../materials/Lines';
import Transform from '../basis/Transform';
import Vector3 from '../basis/Vector3';
import BufferAttribute from '../basis/BufferAttribute';
import Mesh from './Mesh';
import Matrix4 from '../basis/Matrix4';
import Ray from '../basis/Ray';
import Sphere from '../basis/Sphere';
import Raycaster, { RaycastIntersection } from '../basis/Raycaster';

export default class Path {
  transform: Transform;
  constructor(public mesh: Mesh = new BufferMesh(), public material = new Lines({}), private lineSegments = 1) { }

  private start = new Vector3();
  private end = new Vector3();
  computeLineDistances() {
    if (this.mesh instanceof BufferMesh) {

      const positionAttribute = this.mesh.attributes.position;
      const lineDistances = [0];

      for (let i = 1, l = positionAttribute.count; i < l; i++) {

        this.start = Vector3.fromBufferAttribute(positionAttribute, i - 1);
        this.end = Vector3.fromBufferAttribute(positionAttribute, i);

        lineDistances[i] = lineDistances[i - 1];
        lineDistances[i] += this.start.distanceTo(this.end);

      }

      this.mesh.addAttribute('lineDistance', BufferAttribute.fromArray(Float32Array, lineDistances, 1));


    } else {

      const vertices = this.mesh.vertices;
      const lineDistances = this.mesh.lineDistances;

      lineDistances[0] = 0;

      for (let i = 1, l = vertices.length; i < l; i++) {

        lineDistances[i] = lineDistances[i - 1];
        lineDistances[i] += vertices[i - 1].distanceTo(vertices[i]);

      }

    }

    return this;

  }


  private inverseMatrix = new Matrix4();
  private ray = new Ray();
  private sphere = new Sphere();

  raycast(raycaster: Raycaster, intersects: RaycastIntersection[]) {
    const precision = raycaster.linePrecision;

    const mesh = this.mesh;
    const matrixWorld = this.transform.matrixWorld;

    // Checking boundingSphere distance to ray

    if (mesh.boundingSphere === null) mesh.computeBoundingSphere();

    this.sphere = mesh.boundingSphere.clone();
    this.sphere.applyMatrix4(matrixWorld);
    this.sphere.radius += precision;

    if (raycaster.ray.intersectsWithSphere(this.sphere) === false) return;

    //

    this.inverseMatrix.inverse(matrixWorld);
    this.ray = raycaster.ray.clone().applyMatrix4(this.inverseMatrix);

    const localPrecision = precision / ((this.transform.scale.x + this.transform.scale.y + this.transform.scale.z) / 3);
    const localPrecisionSq = localPrecision * localPrecision;

    let vStart = new Vector3();
    let vEnd = new Vector3();
    let interSegment = new Vector3();
    let interRay = new Vector3();
    const step = (0 < this.lineSegments) ? 2 : 1;

    if (mesh instanceof BufferMesh) {

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

          const distSq = this.ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > localPrecisionSq) continue;

          interRay.applyMatrix4(this.transform.matrixWorld); //Move back to world space for distance calculation

          const distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) continue;

          intersects.push({

            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
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

          const distSq = this.ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > localPrecisionSq) continue;

          interRay.applyMatrix4(this.transform.matrixWorld); //Move back to world space for distance calculation

          const distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) continue;

          intersects.push({

            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
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

        const distSq = this.ray.distanceSqToSegment(vertices[i], vertices[i + 1], interRay, interSegment);

        if (distSq > localPrecisionSq) continue;

        interRay.applyMatrix4(this.transform.matrixWorld); //Move back to world space for distance calculation

        const distance = raycaster.ray.origin.distanceTo(interRay);

        if (distance < raycaster.near || distance > raycaster.far) continue;

        intersects.push({

          distance: distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
          index: i,
          faceIndex: -1,
          object: this.transform

        });

      }

    }

  }

  clone() {
    return new Path(this.mesh.clone(), this.material);

  }

}
