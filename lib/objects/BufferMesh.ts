/**
  * @author RkEclair / https://github.com/RkEclair
  */

import BufferAttribute from "../basis/BufferAttribute";
import Mesh from "./Mesh";
import Model from "./Model";

export default class BufferMesh extends Mesh {
  index: BufferAttribute;
  attributes: { [key: string]: BufferAttribute };
  morphAttributes: { [key: string]: BufferAttribute[] };
  groups: { start: number; count: number; materialIndex: number }[];
  drawRange = { start: 0, count: Infinity };
  userData = {};

  clone() {
    const newM = new BufferMesh();
    const positions = BufferAttribute.fromArray(Float32Array, new Array(this.vertices.length * 3), 3);
    const colors = BufferAttribute.fromArray(Float32Array, new Array(this.colors.length * 3), 3);

    newM.addAttribute('position', positions.copyVector3sArray(this.vertices));
    newM.addAttribute('color', colors.copyColorsArray(this.colors));

    if (this.lineDistances && this.lineDistances.length === this.vertices.length) {

      const lineDistances = BufferAttribute.fromArray(Float32Array, this.lineDistances, 1);

      newM.addAttribute('lineDistance', lineDistances);

    }

    if (this.boundingSphere !== null) {

      newM.boundingSphere = this.boundingSphere.clone();

    }

    if (this.boundingBox !== null) {

      newM.boundingBox = this.boundingBox.clone();

    }
    return newM;
  }

  setIndex(index: number[]) {
    if (index.some((v) => v > 65535)) {
      this.index = BufferAttribute.fromArray(Uint32Array, index, 1);
    } else {
      this.index = BufferAttribute.fromArray(Uint16Array, index, 1);
    }
  }
  addAttribute(key: string, attribute: BufferAttribute) {
    this.attributes[key] = attribute;
  }
  removeAttribute(key: string) {
    delete this.attributes[key];
  }
  addGroup(start: number, count: number, materialIndex = 0) {
    this.groups.push({ start, count, materialIndex });
  }

  updateFromObject(object: Model) {
    const mesh = object.mesh;

    let attribute: BufferAttribute;

    if (mesh.verticesNeedUpdate === true) {

      attribute = this.attributes.position;

      if (attribute !== undefined) {

        attribute.copyVector3sArray(mesh.vertices);
        attribute.needsUpdate = true;

      }

      mesh.verticesNeedUpdate = false;

    }

    if (mesh.normalsNeedUpdate === true) {

      attribute = this.attributes.normal;

      if (attribute !== undefined) {

        attribute.copyVector3sArray(mesh.normals);
        attribute.needsUpdate = true;

      }

      mesh.normalsNeedUpdate = false;

    }

    if (mesh.colorsNeedUpdate === true) {

      attribute = this.attributes.color;

      if (attribute !== undefined) {

        attribute.copyColorsArray(mesh.colors);
        attribute.needsUpdate = true;

      }

      mesh.colorsNeedUpdate = false;

    }

    if (mesh.uvsNeedUpdate) {

      attribute = this.attributes.uv;

      if (attribute !== undefined) {

        attribute.copyVector2sArray(mesh.uvs);
        attribute.needsUpdate = true;

      }

      mesh.uvsNeedUpdate = false;

    }

    if (mesh.lineDistancesNeedUpdate) {

      attribute = this.attributes.lineDistance;

      if (attribute !== undefined) {

        attribute.copyArray(mesh.lineDistances);
        attribute.needsUpdate = true;

      }

      mesh.lineDistancesNeedUpdate = false;

    }

    if (mesh.groupsNeedUpdate) {

      mesh.computeGroups(mesh);
      this.groups = mesh.groups;

      mesh.groupsNeedUpdate = false;

    }

    return this;
  }
}
