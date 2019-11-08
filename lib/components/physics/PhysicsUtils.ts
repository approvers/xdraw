/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Ray from "../../basis/Ray";
import Vector3 from "../../basis/Vector3";
import Transform from "../../basis/Transform";
import Vector2 from "../../basis/Vector2";
import Face3 from "../../basis/Face3";

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

type Collider = (ray: Ray) => RaycastIntersection;

export const Raycast = (colliders: Collider[]) => (ray: Ray) => {
	colliders.map(e => e(ray));
};
