/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import Transform, { XObject } from '../basis/Transform';
import Vector2 from '../basis/Vector2';
import Raycaster, { RaycastIntersection } from '../basis/Raycaster';
import Vector3 from '../basis/Vector3';
import Matrix4 from '../basis/Matrix4';
import Triangle from '../basis/Triangle';
import Billboard from '../materials/Billboard';

export class Sprite  {
  
  center = new Vector2(0.5, 0.5);

  constructor(public readonly material = new Billboard()) { }

  raycast(raycaster: Raycaster, intersects: RaycastIntersection[]) {


    function transformVertex(vertexPosition: Vector3, mvPosition: Vector3, center: Vector3, scale: Vector3, sin?: number, cos?: number) {
      // compute position in camera space
      const alignedPosition = vertexPosition.clone().sub(center).addScalar(0.5).multiply(scale);
      const rotatedPosition = alignedPosition.clone();
      // to check if rotation is not zero
      if (sin !== undefined && cos !== undefined) {
        rotatedPosition.x = (cos * alignedPosition.x) - (sin * alignedPosition.y);
        rotatedPosition.y = (sin * alignedPosition.x) + (cos * alignedPosition.y);
      }


      vertexPosition = mvPosition.clone();
      vertexPosition.x += rotatedPosition.x;
      vertexPosition.y += rotatedPosition.y;

      // transform to world space
      return vertexPosition.applyMatrix4(viewWorldMatrix);
    }

    const worldScale = Vector3.fromMatrixScale(this.transform.matrixWorld);
    const viewWorldMatrix = this.transform.matrixWorld.multiply(this.transform.modelViewMatrix.inverse(Matrix4.identity()));
    const mvPosition = Vector3.fromMatrixPosition(this.transform.modelViewMatrix);

    const rotation = this.material.props.rotation;
    let sin = 0, cos = 0;
    if (rotation !== 0) {
      cos = Math.cos(rotation);
      sin = Math.sin(rotation);
    }

    const center = new Vector3(this.center.x, this.center.y);

    const vA = transformVertex(new Vector3(-0.5, -0.5, 0), mvPosition, center, worldScale, sin, cos);
    let vB = transformVertex(new Vector3(0.5, -0.5, 0), mvPosition, center, worldScale, sin, cos);
    const vC = transformVertex(new Vector3(0.5, 0.5, 0), mvPosition, center, worldScale, sin, cos);

    const uvA = new Vector2(0, 0);
    let uvB = new Vector2(1, 0);
    const uvC = new Vector2(1, 1);

    // check first triangle
		let intersectPoint = raycaster.ray.intersectedPointWithTriangle(new Triangle(vA, vB, vC), false);
    if (intersectPoint === null) {

      // check second triangle
      vB = transformVertex(new Vector3(-0.5, 0.5, 0), mvPosition, center, worldScale, sin, cos);
      uvB = new Vector2(0, 1);

			intersectPoint = raycaster.ray.intersectedPointWithTriangle(new Triangle(vA, vC, vB), false)
      if (intersectPoint === null) {
        return;
      }
    }

    const distance = raycaster.ray.origin.distanceTo(intersectPoint);

    if (distance < raycaster.near || distance > raycaster.far) return;

    intersects.push({
			faceIndex: uvB.x == 1 ? 0 : 1,
      distance: distance,
      point: intersectPoint.clone(),
      uv: new Triangle(vA, vB, vC).uv(intersectPoint, [uvA, uvB, uvC]),
      object: this.transform
    });
  }

  clone() {
    const newS = new Sprite(this.material);
    newS.center = this.center.clone();
    return newS;
  }
}
