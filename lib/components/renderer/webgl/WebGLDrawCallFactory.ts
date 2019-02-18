import BufferAttribute, {TypedArray} from '../../../basis/BufferAttribute';
import Transform from '../../../basis/Transform';
import {ShaderSet} from '../../materials/Material';

import WebGLBufferFactory from './WebGLBufferFactory';
import WebGLShaderFactory from './WebGLShaderFactory';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLDrawCallFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  makeDrawCall(
      gl: {
        shaderFactory: WebGLShaderFactory; bufferFactory: WebGLBufferFactory;
      },
      e: {
        transform: Transform; mesh: {[key: string]: BufferAttribute};
        shaders: any[];
        drawType: 'line' | 'triangle';
      }) {
    const vao = this.gl.createVertexArray();
    if (vao === null) throw new Error('Fail to create vertex array.');
    this.gl.bindVertexArray(vao);

    Object.keys(e.mesh).forEach((key) => {
      gl.bufferFactory.makeStaticBuffer(e.mesh[key]);
    });
    e.shaders.forEach((set: ShaderSet) => {
      gl.shaderFactory.makeShader(set.vertexShader, set.fragmentShader);
    });

    this.gl.bindVertexArray(null);
    let mode = this.gl.LINE_STRIP;
    switch (e.drawType) {
      case 'triangle':
        mode = this.gl.TRIANGLE_STRIP;
        break;
    }
    return () => {
      this.gl.bindVertexArray(vao);
      this.gl.drawArrays(mode, 0, e.mesh['indices'].length);
    };
  }
}