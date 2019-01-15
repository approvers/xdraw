import BufferAttribute from "../basis/BufferAttribute";
import Mesh from "./Mesh";

export default class BufferMesh extends Mesh {
  index: BufferAttribute;
  attributes: {[key: string]: BufferAttribute} = {position: null, uv: null};
  morphAttributes = {};
  groups: {start; count; materialIndex}[];
  drawRange = {start: 0, count: Infinity};
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
  addGroup(start: number, count: number, materialIndex = 0) {
    this.groups.push({start, count, materialIndex});
  }
}
