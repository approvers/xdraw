/**
 * @author mrdoob / http://mrdoob.com/
 */

import BufferMesh from '../../objects/BufferMesh.js';
import Model from '../../objects/Model.js';
import Mesh from '../../objects/Mesh.js';
import BufferAttribute from '../../basis/BufferAttribute.js';
import WebGLInfo from './WebGLInfo';

export default class WebGLGeometries {
  meshes: { [key: string]: BufferMesh };
  wireframeAttributes = {};

  constructor(private gl: WebGLRenderingContext, private attributes: WebGLAttributes, private info: WebGLInfo) { }

  onGeometryDispose(event: { target: BufferMesh }) {

    const mesh = event.target;
    const buffermesh = this.meshes[mesh.name];

    if (buffermesh.index !== null) {

      this.attributes.remove(buffermesh.index);

    }

    for (const name in buffermesh.attributes) {

      this.attributes.remove(buffermesh.attributes[name]);

    }

    mesh.removeEventListener('dispose', this.onGeometryDispose);

    delete this.meshes[mesh.name];

    const attribute = this.wireframeAttributes[buffermesh.name];

    if (attribute) {

      this.attributes.remove(attribute);
      delete this.wireframeAttributes[buffermesh.name];

    }

    this.info.memory.geometries--;

  }

  get(object: Model, mesh: Mesh) {

    let buffermesh = this.meshes[mesh.name];

    if (buffermesh) return buffermesh;

    mesh.addEventListener('dispose', this.onGeometryDispose);

    if (mesh instanceof BufferMesh) {

      buffermesh = mesh;

    } else {

      buffermesh = BufferMesh.fromModel(object);

    }

    this.meshes[mesh.name] = buffermesh;

    this.info.memory.geometries++;

    return buffermesh;

  }

  update(mesh: BufferMesh) {

    const index = mesh.index;
    const meshAttributes = mesh.attributes;

    if (index !== null) {

      this.attributes.update(index, this.gl.ELEMENT_ARRAY_BUFFER);

    }

    for (const name in meshAttributes) {

      this.attributes.update(meshAttributes[name], this.gl.ARRAY_BUFFER);

    }

    // morph targets

    const morphAttributes = mesh.morphAttributes;

    for (const name in morphAttributes) {
      morphAttributes[name].forEach(e => this.attributes.update(e, this.gl.ARRAY_BUFFER));
    }
  }


  getWireframeAttribute(mesh: BufferMesh) {

    let attribute = this.wireframeAttributes[mesh.name];

    if (attribute) return attribute;

    const indices = [];

    const meshIndex = mesh.index;
    const meshAttributes = mesh.attributes;

    if (meshIndex !== null) {

      const array = meshIndex.array;

      for (let i = 0, l = array.length; i < l; i += 3) {

        const a = array[i + 0];
        const b = array[i + 1];
        const c = array[i + 2];

        indices.push(a, b, b, c, c, a);

      }

    } else {

      const array = meshAttributes.position.array;

      for (let i = 0, l = (array.length / 3) - 1; i < l; i += 3) {

        const a = i + 0;
        const b = i + 1;
        const c = i + 2;

        indices.push(a, b, b, c, c, a);

      }

    }

		if (indices.some(e => e > 65535)) {
			attribute = BufferAttribute.fromArray(Uint32Array, indices, 1);
		} else {
			attribute = BufferAttribute.fromArray(Uint16Array, indices, 1);
		}

    this.attributes.update(attribute, this.gl.ELEMENT_ARRAY_BUFFER);

    this.wireframeAttributes[mesh.name] = attribute;

    return attribute;
  }
}
