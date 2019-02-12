/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Model from '../../objects/Model';
import BufferMesh from '../../meshes/BufferMesh';

export default class WebGLObjects {
	private updateList = {};

  constructor() {  }

	update(object: Model, frame: number) {


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
