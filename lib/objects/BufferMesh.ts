import BufferAttribute from "../basis/BufferAttribute";
import Mesh from "./Mesh";
import Model from "./Model";

export default class BufferMesh extends Mesh {
  static fromModel(object: Model) {
    const newM = new BufferMesh();

    const mesh = object.mesh;

    if (object instanceof Points || object instanceof Line) {

      const positions = BufferAttribute.fromArray(Float32Array, new Array(mesh.vertices.length * 3), 3);
      const colors = BufferAttribute.fromArray(Float32Array, new Array(mesh.colors.length * 3), 3);

      newM.addAttribute('position', positions.copyVector3sArray(mesh.vertices));
      newM.addAttribute('color', colors.copyColorsArray(mesh.colors));

      if (mesh.lineDistances && mesh.lineDistances.length === mesh.vertices.length) {

        const lineDistances = BufferAttribute.fromArray(Float32Array, new Array(mesh.lineDistances.length), 1);

        newM.addAttribute('lineDistance', lineDistances.copyArray(mesh.lineDistances));

      }

      if (mesh.boundingSphere !== null) {

        newM.boundingSphere = mesh.boundingSphere.clone();

      }

      if (mesh.boundingBox !== null) {

        newM.boundingBox = mesh.boundingBox.clone();

      }

    }
    return newM;
  }

  index: BufferAttribute;
  attributes: { [key: string]: BufferAttribute } = { position: null, uv: null };
  morphAttributes = {};
  groups: { start; count; materialIndex }[];
  drawRange = { start: 0, count: Infinity };
  userData = {};

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
}
