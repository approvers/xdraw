/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import WebGLExtensions from "./WebGLExtensions";
import WebGLCapabilities from "./WebGLCapabilities";
import Mesh from "../../meshes/Mesh";

export default class WebGLBufferRenderer {

  constructor(protected gl: WebGLRenderingContext, protected extensions: WebGLExtensions, protected capabilities: WebGLCapabilities) { }

  protected mode: number;

  setMode(value: number) {

    this.mode = value;

  }

  render(start: number, count: number) {

    this.gl.drawArrays(this.mode, start, count);

  }

  renderInstances(mesh: Mesh, start: number, count: number) {

    let extension: WebGLRenderingContext | null;

    if (this.capabilities.isWebGL2) {

      extension = this.gl;

    } else {

      extension = this.extensions.get('ANGLE_instanced_arrays');

      if (extension === null) {

        console.error('using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
        return;

      }

    }

    extension[this.capabilities.isWebGL2 ? 'drawArraysInstanced' : 'drawArraysInstancedANGLE'](this.mode, start, count, mesh.maxInstancedCount);

  }
}
