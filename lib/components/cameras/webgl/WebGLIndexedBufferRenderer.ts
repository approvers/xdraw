/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import WebGLExtensions from "./WebGLExtensions";
import WebGLCapabilities from "./WebGLCapabilities";
import WebGLBufferRenderer from "./WebGLBufferRenderer";
import Mesh from "../../meshes/Mesh";

export default class WebGLIndexedBufferRenderer extends WebGLBufferRenderer {

  constructor(gl: WebGLRenderingContext, extensions: WebGLExtensions, capabilities: WebGLCapabilities) {
    super(gl, extensions, capabilities);
  }

  private type: number;
  private bytesPerElement: number;

  setIndex(value: { type: number; bytesPerElement: number; }) {

    this.type = value.type;
    this.bytesPerElement = value.bytesPerElement;

  }

  render(start: number, count: number) {

    this.gl.drawElements(this.mode, count, this.type, start * this.bytesPerElement);

  }

  renderInstances(mesh: Mesh, start: number, count: number) {

    let extension: WebGLRenderingContext | null;

    if (this.capabilities.isWebGL2) {

      extension = this.gl;

    } else {

      extension = this.extensions.get('ANGLE_instanced_arrays');

      if (extension === null) {

        console.error('THREE.WebGLIndexedBufferRenderer: using THREE.InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
        return;

      }

    }

    extension[this.capabilities.isWebGL2 ? 'drawElementsInstanced' : 'drawElementsInstancedANGLE'](this.mode, count, this.type, start * this.bytesPerElement, mesh.maxInstancedCount);

  }
}
