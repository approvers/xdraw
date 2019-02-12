/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import { Shader } from "../Material";

const Cube: Shader = {
  uniforms: {
    tCube: new Float32Array([]),
    tFlip: new Int32Array([-1]),
    opacity: new Float32Array([1.0])
  },
  vertexShader: `
		varying vec3 vWorldDirection;
		#include <common>
		void main() {
			vWorldDirection = transformDirection( position, modelMatrix );
			#include <begin_vertex>
			#include <project_vertex>
			gl_Position.z = gl_Position.w; // set z to camera.far
		}
	`,
  fragmentShader: `
		uniform samplerCube tCube;
		uniform float tFlip;
		uniform float opacity;
		varying vec3 vWorldDirection;
		void main() {
			vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
			gl_FragColor = mapTexelToLinear( texColor );
			gl_FragColor.a *= opacity;
			#include <tonemapping_fragment>
			#include <encodings_fragment>
		}
	`
};

export default Cube;
