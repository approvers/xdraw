import BufferAttribute from '../../basis/BufferAttribute';
import {Component} from '../../basis/Component';

const MeshUpdater = (data: {[name: string]: BufferAttribute}) => (
    attributeLocations:
        {[name: string]: number}) => (gl: WebGL2RenderingContext) => {
  // Add VBO
  Object.keys(attributeLocations).forEach((key) => {
    if (key === 'index') return;
    const attributeLocation = attributeLocations[key];
    if (attributeLocation === undefined || attributeLocation === null) return;
    const buf = gl.createBuffer();
    if (buf === null) throw new Error('Fail to create buffer.');
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data[key].array, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(attributeLocation);
    gl.vertexAttribPointer(
        attributeLocation, data[key].itemSize,
        data[key].isFloat ? gl.FLOAT : gl.INT, false, 0, 0);
  });

  // Add IBO
  if (data['index'] && 0 < data['index'].count) {
    const indexBuf = gl.createBuffer();
    if (indexBuf === null) throw new Error('Fail to create index buffer.');

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, data['index'].array, gl.STATIC_DRAW);
    return (mode: number) => gl.drawElements(
               mode, data['index'].count,
               data['index'].array instanceof Uint16Array ? gl.UNSIGNED_SHORT :
                                                            gl.UNSIGNED_INT,
               0);
  }

  const count = (data['position'] ? data['position'].length : 0);
  return (mode: number) => gl.drawArrays(mode, 0, count);
};

export default class Mesh extends Component {
  packMesh(nums: {
    indices: number[],
    vertices: number[],
    normals: number[],
    uvs: number[]
  }) {
    const attributes = {
      index: (nums['indices'] && nums['indices'].some((v) => v > 65535)) ?
          BufferAttribute.fromArray(Uint32Array, nums['indices'], 1) :
          BufferAttribute.fromArray(Uint16Array, nums['indices'], 1),
      position: BufferAttribute.fromArray(Float32Array, nums['vertices'], 3),
      normal: BufferAttribute.fromArray(Float32Array, nums['normals'], 3),
      uv: BufferAttribute.fromArray(Float32Array, nums['uvs'], 2)
    };
    this.store.addEvent().then(() => MeshUpdater(attributes));
  }
}