/**
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from '../../basis/BufferAttribute';
import {XStore} from '../../basis/Components';

function makeAttribute(gl: WebGL2RenderingContext, data: BufferAttribute) {
  const buf = gl.createBuffer();
  if (buf === null) throw new Error('Fail to create buffer.');
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, data.array, gl.STATIC_DRAW);
  return (attributeLocation: number) => {
    gl.enableVertexAttribArray(attributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.vertexAttribPointer(
        attributeLocation, data.length, data.isFloat ? gl.FLOAT : gl.INT, false,
        0, 0);
  }
}

export function packMesh(store: XStore, nums: {[key: string]: number[]}) {
  const attributes = {
    indices: (nums['indices'].some((v) => v > 65535)) ?
        BufferAttribute.fromArray(Uint32Array, nums['indices'], 1) :
        BufferAttribute.fromArray(Uint16Array, nums['indices'], 1),
    position: BufferAttribute.fromArray(Float32Array, nums['vertices'], 3),
    normal: BufferAttribute.fromArray(Float32Array, nums['normals'], 3),
    uv: BufferAttribute.fromArray(Float32Array, nums['uvs'], 2)
  };
  store.set('mesh', Object.keys(attributes).reduce((prev, e) => {
    prev[e] = (gl: WebGL2RenderingContext) => makeAttribute(gl, attributes[e]);
    return prev;
  }, {}));
}
