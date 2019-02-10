/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import WebGLExtensions from "./WebGLExtensions";
import WebGLInfo from "./WebGLInfo";
import WebGLCapabilities from "./WebGLCapabilities";
import Mesh from "../../objects/Mesh";

export default class WebGLIndexedBufferRenderer {

  constructor(private gl: WebGLRenderingContext, private extensions: WebGLExtensions, private info: WebGLInfo, private capabilities: WebGLCapabilities) { }

  private mode: number;

  setMode(value: number) {

    this.mode = value;

  }

  private type: number;
  private bytesPerElement: number;

  setIndex(value: { type: number; bytesPerElement: number; }) {

    this.type = value.type;
    this.bytesPerElement = value.bytesPerElement;

  }

  render(start: number, count: number) {

    this.gl.drawElements(this.mode, count, this.type, start * this.bytesPerElement);

    this.info.update(count, this.mode);

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

    this.info.update(count, this.mode, mesh.maxInstancedCount);

  }
}
