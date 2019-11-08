/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Euler from '../basis/Euler';
import Vector3 from '../basis/Vector3';

import Diffuse from './materials/Diffuse';
import Unlit from './materials/Unlit';
import BoxMesh from './meshes/BoxMesh';
import PlaneMesh from './meshes/PlaneMesh';
import Transform from './Transform';

export function BackgroundPlane(width = 1, height = 1) {
  const t = new Transform;
  t.recieveRaycast = false;
  t.recieveShadow = false;
  t.castShadow = false;
  t.addComponent(new PlaneMesh(width, height));
  t.addComponent(new Unlit());
  return t;
}

export function BackgroundBox(width = 1, height = 1, depth = 1) {
  const t = new Transform;
  t.addComponent(new BoxMesh(width, height, depth));
  t.addComponent(new Unlit());
  return t;
}

export function SimpleBox(width = 1, height = 1, depth = 1) {
  return new ModelBuilder()
      .mesh(new BoxMesh(width, height, depth))
      .material(new Diffuse())
      .build();
}

export class ModelBuilder {
  private _mesh?: Mesh = undefined;
  private _mat?: Material = undefined;

  mesh(mesh: Mesh): this {
    this._mesh = mesh;
    return this;
  }

  material(mat: Material): this {
    this._mat = mat;
    return this;
  }

  build(): Model {
    return new Model(this.mesh, this.material);
  }
}

class Model {
  private transform = new Transform;

  constructor(mesh: Mesh, mat: Material) {}

  translate(amount: Vector3): void {
    this.transform.translate(amount);
  }

  rotate(amount: Euler): void {
    this.transform.rotate(amount);
  }

  scale(amount: Vector3) {
    this.transform.scale.multiply(amount);
  }
}
