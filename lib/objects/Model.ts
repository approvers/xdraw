/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Color from '../basis/Color';
import EventSource from '../basis/EventSource';
import Matrix4 from '../basis/Matrix4';
import Raycaster, { RaycastIntersection } from '../basis/Raycaster';
import Transform from '../basis/Transform';
import Vector3 from '../basis/Vector3';
import { TraiangleDrawMode } from '../cameras/DrawTypes';
import GLSLShader from '../materials/GLSLShader';
import Unlit from '../materials/Unlit';
import Background from '../materials/shaders/Background';
import Cube from '../materials/shaders/Cube';
import Material from '../materials/Material';
import BufferMesh from './BufferMesh';
import BoxMesh from './meshes/BoxMesh';
import PlaneMesh from './meshes/PlaneMesh';

export default class Model extends EventSource {
  static plane(width = 1, height = 1) {
    return new Model(new PlaneMesh(width, height), new GLSLShader({
      name: 'BackgroundMaterial',
      shader: Background,
      side: 'Front',
      depthTest: false,
      depthWrite: false,
      fog: false
    }));
  }
  static cube(width = 1, height = 1, depth = 1) {
    return new Model(new BoxMesh(width, height, depth), new GLSLShader({
      name: 'BackgroundCubeMaterial',
      shader: Cube,
      side: 'Back',
      depthTest: true,
      depthWrite: false,
      fog: false
    }));
  }

  transform: Transform;
  drawMode: TraiangleDrawMode;
  morphTargetInfluences = [];
  morphTargetDictionary = {};

  constructor(public mesh: BufferMesh = new BufferMesh(), public material: Material = new Unlit({})) {
    super();
    if (material instanceof Unlit) material.color = new Color(Math.random() * 0xffffff);
    this.updateMorphTargets();
  }

  clone() {
    const newM = new Model();
    newM.drawMode = this.drawMode;
    newM.morphTargetInfluences = this.morphTargetInfluences.slice();
    newM.morphTargetDictionary = { ...this.morphTargetDictionary };
    return newM;
  }

  updateMorphTargets() {
    const mesh = this.mesh;
    if (mesh instanceof BufferMesh) {
      const morphAttributes = mesh.morphAttributes;
      const keys = Object.keys(morphAttributes);

      if (keys.length > 0) {
        const morphAttribute = morphAttributes[keys[0]];

        if (morphAttribute !== undefined) {
          this.morphTargetInfluences = [];
          this.morphTargetDictionary = {};

          for (let m = 0; m < morphAttribute.length; m++) {
            const name = morphAttribute[m].name || String(m);

            this.morphTargetInfluences.push(0);
            this.morphTargetDictionary[name] = m;
          }
        }
      }
    }
  }

  raycast(raycaster: Raycaster, intersects: RaycastIntersection[]) {
    const inverseMatrix = new Matrix4();
    const intersectionPoint = new Vector3();
    const mesh = this.mesh;
    const material = this.material;
    const matrixWorld = this.transform.matrixWorld;

    if (material === undefined) return;

    // Checking boundingSphere distance to ray

    if (mesh.boundingSphere === null) mesh.computeBoundingSphere();

    const sphere = mesh.boundingSphere.clone();
    sphere.applyMatrix4(matrixWorld);

    if (!raycaster.ray.intersectsWithSphere(sphere)) return;

    //

    inverseMatrix.inverse(matrixWorld);
    const ray = raycaster.ray.clone();
    ray.applyMatrix4(inverseMatrix);

    // Check boundingBox before continuing

    if (mesh.boundingBox !== null) {
      if (!ray.intersectsWithBox(mesh.boundingBox)) return;
    }

    if (mesh instanceof BufferMesh) {
      const index = mesh.index;
      const position = mesh.attributes.position;
      const uv = mesh.attributes.uv;
      const groups = mesh.groups;
      const drawRange = mesh.drawRange;

      if (index !== null) {
        // indexed buffer mesh

        if (Array.isArray(material)) {
          for (const group of groups) {
            const groupMaterial = material[group.materialIndex];

            const start = Math.max(group.start, drawRange.start);
            const end = Math.min(
              group.start + group.count, drawRange.start + drawRange.count);

            for (let i = start; i < end; i += 3) {
              const a = index.getX(i);
              const b = index.getX(i + 1);
              const c = index.getX(i + 2);

              const intersection = raycaster.checkBufferMeshIntersection(
                this.transform, groupMaterial, position, uv, a, b, c,
                intersectionPoint);

              if (intersection) {
                intersection.faceIndex = Math.floor(
                  i / 3);  // triangle number in indexed buffer semantics
                intersects.push(intersection);
              }
            }
          }
        } else {
          const start = Math.max(0, drawRange.start);
          const end = Math.min(index.count, drawRange.start + drawRange.count);

          for (let i = start; i < end; i += 3) {
            const a = index.getX(i);
            const b = index.getX(i + 1);
            const c = index.getX(i + 2);

            const intersection = raycaster.checkBufferMeshIntersection(
              this.transform, material, position, uv, a, b, c,
              intersectionPoint);

            if (intersection) {
              intersection.faceIndex = Math.floor(
                i / 3);  // triangle number in indexed buffer semantics
              intersects.push(intersection);
            }
          }
        }
      } else if (position !== null) {
        // non-indexed buffer mesh

        if (Array.isArray(material)) {
          for (const group of groups) {
            const groupMaterial = material[group.materialIndex];

            const start = Math.max(group.start, drawRange.start);
            const end = Math.min(
              group.start + group.count, drawRange.start + drawRange.count);

            for (let i = start; i < end; i += 3) {
              const a = i;
              const b = i + 1;
              const c = i + 2;

              const intersection = raycaster.checkBufferMeshIntersection(
                this.transform, groupMaterial, position, uv, a, b, c,
                intersectionPoint);

              if (intersection) {
                intersection.faceIndex =
                  Math.floor(i / 3);  // triangle number in non-indexed
                // buffer semantics
                intersects.push(intersection);
              }
            }
          }
        } else {
          const start = Math.max(0, drawRange.start);
          const end =
            Math.min(position.count, drawRange.start + drawRange.count);

          for (let i = start; i < end; i += 3) {
            const a = i;
            const b = i + 1;
            const c = i + 2;

            const intersection = raycaster.checkBufferMeshIntersection(
              this.transform, material, position, uv, a, b, c,
              intersectionPoint);

            if (intersection) {
              intersection.faceIndex = Math.floor(
                i / 3);  // triangle number in non-indexed buffer semantics
              intersects.push(intersection);
            }
          }
        }
      }
    }
  }
}
