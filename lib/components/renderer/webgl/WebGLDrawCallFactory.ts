import Transform from '../../../basis/Transform';
import {MeshExports} from '../../meshes/MeshUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLDrawCallFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  makeDrawCall({transform, mesh, material}: {
    transform: Transform;
    mesh?: MeshExports;
    material?: {
      uniforms: (locations: {[locationName: string]: WebGLUniformLocation;}) =>
          (gl: WebGL2RenderingContext) => void
      renderer:
          (gl: WebGL2RenderingContext,
           drawCall: (mode: number) => void) => void;
      shader: (gl: WebGL2RenderingContext) => {
        use: () => void;
        uniforms: {[name: string]: number;};
        attributes: {[name: string]: number;};
      };
    };
  }) {
    if (mesh === undefined || material === undefined) {
      return () => {};
    }
    const shader = material.shader(this.gl);
    const meshUpdaters = mesh(shader.attributes);
    material.uniforms(shader.uniforms)(this.gl);
    return () => {
      const {start, count} = meshUpdaters(this.gl);
      shader.use();
      this.gl.uniformMatrix4fv(shader.uniforms['modelViewProjection'], false, transform.matrix.toArray());
      material.renderer(
          this.gl, (mode: number) => {this.gl.drawArrays(mode, start, count)});
    };
  }
}