import Material from '../../materials/Material';
import Mesh from '../../meshes/Mesh';

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export type meshAndShader = {
  mesh?: Mesh;
  material?: Material;
};

export default class WebGLDrawCallFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  makeDrawCall({mesh, material}: meshAndShader) {
    if (mesh === undefined || material === undefined) {
      return () => {};
    }
    const program = material.apply(this.gl);
    const vao = this.gl.createVertexArray();
    if (vao === null) throw new Error('Fail to create vertex array.');
    this.gl.bindVertexArray(vao);
    const call = mesh.apply(this.gl, program.attributes);
    this.gl.bindVertexArray(null);

    return () => {
      program.use(vao);
      material.render(this.gl, call);
    };
  }
}