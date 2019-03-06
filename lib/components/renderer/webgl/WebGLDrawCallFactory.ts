import {MaterialExports} from '../../materials/MaterialUtils';
import {MeshExports} from '../../meshes/MeshUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export type meshAndShader = {
  mesh?: MeshExports;
  material?: MaterialExports;
};

export default class WebGLDrawCallFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  makeDrawCall({mesh, material}: meshAndShader) {
    if (mesh === undefined || material === undefined) {
      return () => {};
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
      material.render(this.gl, call);
    };
  }
}