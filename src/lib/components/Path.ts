/**
 * @author mrdoob / http://mrdoob.com/
 * @author MikuroXina / https://github.com/MikuroXina
 */

import BufferMesh from "./BufferMesh";
import Lines from "../materials/Lines";
import Transform from "../basis/Component";
import Vector3 from "../basis/Vector3";
import BufferAttribute from "../basis/BufferAttribute";
import Mesh from "./Mesh";
import Matrix4 from "../basis/Matrix4";
import Ray from "../basis/Ray";
import Sphere from "../basis/Sphere";
import Raycaster, { RaycastIntersection } from "../basis/Raycaster";

export default class Path {
  constructor(
    public mesh: Mesh = new BufferMesh(),
    public material = new Lines({}),
    private lineSegments = 1,
  ) {}

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

      this.mesh.addAttribute(
        "lineDistance",
        BufferAttribute.fromArray(Float32Array, lineDistances, 1),
      );
    } else {
      const { vertices } = this.mesh;
      const { lineDistances } = this.mesh;

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

  clone() {
    return new Path(this.mesh.clone(), this.material);
  }
}
