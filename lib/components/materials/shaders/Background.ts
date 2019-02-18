/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {Shader} from '../Material';

const Background: Shader = {
  uniforms: {
    'uvTransform': new Float32Array(),
    't2D': new Int32Array(),
  },
  vertexShader: `
		varying vec2 vUv;
		uniform mat3 uvTransform;
		void main() {
			vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
			gl_Position = vec4( position.xy, 1.0, 1.0 );
		}
	`,
  fragmentShader: `
		uniform sampler2D t2D;
		varying vec2 vUv;
		void main() {
			vec4 texColor = texture2D( t2D, vUv );
			gl_FragColor = mapTexelToLinear( texColor );
			#include <tonemapping_fragment>
			#include <encodings_fragment>
		}
	`
};

export default Background;
