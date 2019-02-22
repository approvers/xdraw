import Transform from '../../../basis/Transform';
import {MaterialExports} from '../../materials/MaterialUtils';
import {MeshExports} from '../../meshes/MeshUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLDrawCallFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  makeDrawCall({transform, mesh, material}: {
    transform: Transform;
    mesh?: MeshExports;
    material?: MaterialExports;
  }) {
    console.log(mesh, material);
    if (mesh === undefined || material === undefined) {
      return () => {
        console.warn('The mesh or material are missing.');
      };
    }
    const shader = material.shader(this.gl);
    material.uniforms(shader.uniforms)(this.gl);
    return () => {
      shader.use();
      const {start, count} = mesh(shader.attributes)(this.gl);
      this.gl.uniformMatrix4fv(
          shader.uniforms['modelViewProjection'], false,
          transform.matrix.toArray());
      console.log(count);
      material.renderer(
          this.gl, (mode: number) => {this.gl.drawArrays(mode, start, count)});
    };
  }
}