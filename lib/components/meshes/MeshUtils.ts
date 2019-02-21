/**
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from '../../basis/BufferAttribute';
import {XStore} from '../../basis/Components';

const MeshUpdater = (data: {[name: string]: BufferAttribute}) =>
    (attributeLocations: {[name: string]: number}) => (
        gl: WebGL2RenderingContext) => {
      Object.keys(attributeLocations).forEach((key) => {
        const buf = gl.createBuffer();
        if (buf === null) throw new Error('Fail to create buffer.');
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, data[key].array, gl.STATIC_DRAW);
        const attributeLocation = attributeLocations[key];
        gl.enableVertexAttribArray(attributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.vertexAttribPointer(
            attributeLocation, data[key].count,
            data[key].isFloat ? gl.FLOAT : gl.INT, false, 0, 0);
      });
      return {start: 0, count: (data['vertices'] ? data['vertices'].count : 0)};
    };

export function packMesh(store: XStore, nums: {[key: string]: number[]}) {
  const attributes = {
    indices: (nums['indices'] && nums['indices'].some((v) => v > 65535)) ?
        BufferAttribute.fromArray(Uint32Array, nums['indices'], 1) :
        BufferAttribute.fromArray(Uint16Array, nums['indices'], 1),
    position: BufferAttribute.fromArray(Float32Array, nums['vertices'], 3),
    normal: BufferAttribute.fromArray(Float32Array, nums['normals'], 3),
    uv: BufferAttribute.fromArray(Float32Array, nums['uvs'], 2)
  };
  store.set('mesh', MeshUpdater(attributes));
}

export type MeshExports = (attributeLocations: {[name: string]: number;}) =>
    (gl: WebGL2RenderingContext) => {
      start: number;
      count: number;
    };
