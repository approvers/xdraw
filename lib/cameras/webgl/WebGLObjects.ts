/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Mesh from '../../objects/Mesh';
import Model from '../../objects/Model';

export default class WebGLObjects {
	private updateList = {};

  constructor(private meshes: WebGLMeshes, private info: WebGLInfo) {  }

	update(object: Model) {

		const frame = this.info.render.frame;

		const mesh = object.mesh;
		const bufferMesh = this.meshes.get(object, mesh);

		// Update once per frame

		if (this.updateList[bufferMesh.id] !== frame) {

			if (mesh instanceof Mesh) {

				bufferMesh.updateFromObject(object);

			}

			this.meshes.update(bufferMesh);

			this.updateList[bufferMesh.name] = frame;

		}

		return bufferMesh;

	}

	dispose() {

		this.updateList = {};

	}
}
