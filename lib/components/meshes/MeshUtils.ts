/**
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from '../../basis/BufferAttribute';
import {XStore} from '../../basis/Components';

const MeshUpdater = (data: {[name: string]: BufferAttribute}) =>
    (attributeLocations: {[name: string]: number}) =>
        (gl: WebGL2RenderingContext) => {
          // Add VBO
          Object.keys(attributeLocations).forEach((key) => {
            const attributeLocation = attributeLocations[key];
            if (attributeLocation === undefined || attributeLocation === null)
              return;
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
            if (indexBuf === null)
              throw new Error('Fail to create index buffer.');
            console.log(data['index']);

            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuf);
            gl.bufferData(gl.ARRAY_BUFFER, data['index'].array, gl.STATIC_DRAW);
            return (mode: number) => gl.drawElements(
                       mode, data['index'].count,
                       data['index'].array instanceof Uint16Array ?
                           gl.UNSIGNED_SHORT :
                           gl.UNSIGNED_INT,
                       0);
          }

          const count = (data['position'] ? data['position'].length : 0);
          return (mode: number) => gl.drawArrays(mode, 0, count);
        };

export function packMesh(store: XStore, nums: {[key: string]: number[]}) {
  const attributes = {
    index: (nums['indices'] && nums['indices'].some((v) => v > 65535)) ?
        BufferAttribute.fromArray(Uint32Array, nums['indices'], 1) :
        BufferAttribute.fromArray(Uint16Array, nums['indices'], 1),
    position: BufferAttribute.fromArray(Float32Array, nums['vertices'], 3),
    normal: BufferAttribute.fromArray(Float32Array, nums['normals'], 3),
    uv: BufferAttribute.fromArray(Float32Array, nums['uvs'], 2)
  };
  store.set('mesh', MeshUpdater(attributes));
}

export type MeshExports = (attributeLocations: {[name: string]: number;}) =>
    (gl: WebGL2RenderingContext) => (mode: number) => void;
