/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Mesh from '../../objects/Mesh';
import Model from '../../objects/Model';
import WebGLInfo from './WebGLInfo';
import BufferMesh from '../../objects/BufferMesh';

export default class WebGLObjects {
	private updateList = {};

  constructor(private info: WebGLInfo) {  }

	update(object: Model) {

		const frame = this.info.render.frame;

		const mesh = object.mesh;

		// Update once per frame

		if (this.updateList[mesh.name] !== frame) {

			if (mesh instanceof BufferMesh) {

				mesh.updateFromObject(object);

			}

			this.updateList[mesh.name] = frame;

		}

		return mesh;

	}

	dispose() {

		this.updateList = {};

	}
}
