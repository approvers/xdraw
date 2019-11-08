import {MaterialExports} from '../../materials/MaterialUtils';
import {MeshExports} from '../../meshes/MeshUtils';

/**
 * @author MikuroXina / https://github.com/MikuroXina
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
    const appliedMat = material(this.gl);
    const vao = this.gl.createVertexArray();
    if (vao === null) throw new Error('Fail to create vertex array.');
    const shader = appliedMat.shader;
    this.gl.bindVertexArray(vao);
    appliedMat.uniforms(shader.uniforms);
    const call = mesh(shader.attributes)(this.gl);
    this.gl.bindVertexArray(null);

    return () => {
      shader.use(vao);
      appliedMat.render(this.gl, call);
    };
  }
}