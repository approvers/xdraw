import {meshAndShader} from '../MeshRenderer';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLDrawCallFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  makeDrawCall({matrix, mesh, material}: meshAndShader) {
    if (mesh === undefined || material === undefined) {
      return () => {
        console.warn('The mesh or material are missing.');
      };
    }
    const vao = this.gl.createVertexArray();
    if (vao === null) throw new Error('Fail to create vertex array.');
    this.gl.bindVertexArray(vao);
    const shader = material.shader(this.gl);
    material.uniforms(shader.uniforms)(this.gl);
    const call = mesh(shader.attributes)(this.gl);
    this.gl.bindVertexArray(null);

    return () => {
      shader.use(vao);
      this.gl.uniformMatrix4fv(
          shader.uniforms['modelViewProjection'], false, matrix.toArray());
      material.render(this.gl, call);
    };
  }
}