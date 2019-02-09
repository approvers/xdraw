/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

import { WebGLLights } from './WebGLLights';
import Scene from '../../objects/Scene';
import Camera from '../Camera';

class WebGLRenderState {
	lights = new WebGLLights();

	lightsArray: Light[] = [];
	shadowsArray: Light[] = [];

	init() {
		this.lightsArray.length = 0;
		this.shadowsArray.length = 0;
	}

	pushLight( light: Light ) {

		this.lightsArray.push( light );

	}

	pushShadow( shadowLight: Light ) {

		this.shadowsArray.push( shadowLight );

	}

	setupLights( camera: Camera ) {

		this.lights.setup( this.lightsArray, this.shadowsArray, camera );

	}
}

export default class WebGLRenderStates {

	renderStates = {};
	current: WebGLRenderState;

	private onSceneDispose( event: { [key: string]: any; target: any; } ) {

		const scene = event.target;

		scene.removeEventListener( 'dispose', this.onSceneDispose );

		delete this.renderStates[ scene.transform.id ];

	}

	setCurrent( scene: Scene, camera: Camera ) {
		const renderStates = this.renderStates;

		if ( renderStates[ scene.transform.id ] === undefined ) {

			this.current = new WebGLRenderState();
			renderStates[ scene.transform.id ] = {};
			renderStates[ scene.transform.id ][ camera.transform.id ] = this.current;

			scene.addEventListener( 'dispose', this.onSceneDispose );

		} else {

			if ( renderStates[ scene.transform.id ][ camera.transform.id ] === undefined ) {

				this.current = new WebGLRenderState();
				renderStates[ scene.transform.id ][ camera.transform.id ] = this.current;

			} else {

				this.current = renderStates[ scene.transform.id ][ camera.transform.id ];

			}

		}
	}

	dispose() {
		this.renderStates = {};
	}
}
