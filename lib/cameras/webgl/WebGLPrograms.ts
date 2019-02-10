/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import { TextureEncoding } from '../DrawTypes.js';
import Texture from '../../textures/Texture.js';
import WebGLCapabilities from './WebGLCapabilities.js';
import WebGLExtensions from './WebGLExtensions.js';
import Renderer from '../Renderer.js';
import Material from '../../materials/Material.js';
import WebGLLights from './WebGLLights.js';
import { LightShadow } from '../../objects/Light.js';
import { XObject } from '../../basis/Transform.js';
import GLSLShader from '../../materials/GLSLShader.js';
import WebGLUniforms from './WebGLUniforms.js';
import WebGLAttributes from './WebGLAttributes.js';

const vertProgramTemplate = (program = `
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`) => `
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

${program}
`;

export class WebGLProgramService {
	diagnostics: {
		runnable: boolean;
		material: Material;
		vertShaderLog: string | null;
		fragShaderLog: string | null;
	};

	uniforms: WebGLUniforms;
	attributes: WebGLAttributes;

  private program: WebGLProgram;

  constructor(private gl: WebGLRenderingContext, material: Material, public name: string) {
    const vertCompiler = new Promise((resolve, reject) => {
      const vert = gl.createShader(gl.VERTEX_SHADER);
      if (vert === null) { reject('Failed to create vertex shader.'); return; }

      gl.shaderSource(vert, vertProgramTemplate(
        (material instanceof GLSLShader) ? material.shader.vertexShader : `
				void main() {
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`));
      gl.compileShader(vert);

      if (gl.getShaderInfoLog(vert) !== '') {
        console.warn('Vertex Shader Compilation: ', gl.getShaderInfoLog(vert));
      }

      if (gl.getShaderParameter(vert, gl.COMPILE_STATUS) === false) {
        reject('Failed to compile vertex shader');
        return;
      }

      resolve(vert);
    });

    const fragCompiler = new Promise((resolve) => {
      const frag = gl.createShader(gl.FRAGMENT_SHADER);
      if (frag === null) { throw new Error('Failed to create fragment shader.'); }

      gl.shaderSource(frag, vertProgramTemplate(
        (material instanceof GLSLShader) ? material.shader.fragmentShader : `
		    void main() {
			    gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
		    }`));
      gl.compileShader(frag);

      if (gl.getShaderInfoLog(frag) !== '') {
        console.warn('Fragment Shader Compilation: ', gl.getShaderInfoLog(frag));
      }

      if (gl.getShaderParameter(frag, gl.COMPILE_STATUS) === false) {
        throw new Error('Failed to compile fragment shader.');
      }

      resolve(frag);
    });

    Promise.all([vertCompiler, fragCompiler]).then(shaders => {
      const program = gl.createProgram();
      if (program === null) { throw new Error('Failed to create glsl program.'); }

      shaders.forEach(e => gl.attachShader(program, e));
      gl.linkProgram(program);

      if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
				throw new Error('Failed to link shaders.');
      } else if (gl.getProgramInfoLog(program) !== '') {
				console.warn('Shader Link: ', gl.getProgramInfoLog(program));
			}

			if (shaders.map(e => gl.getShaderInfoLog(e)).some(e => e !== '')) {
				this.diagnostics = {
					runnable: true,
					material,
					vertShaderLog: gl.getShaderInfoLog(shaders[0]),
					fragShaderLog: gl.getShaderInfoLog(shaders[1]),
				};
			}

			shaders.forEach(e => gl.deleteShader(e));
			this.program = program;
			this.uniforms = new WebGLUniforms(gl, program);
			this.attributes = new WebGLAttributes(gl, program);
    });
  }

	private refCount: number;

	acquire(){
    ++this.refCount;
	}

	release(){
		--this.refCount;
    if (this.refCount <= 0) {
      this.gl.deleteProgram(this.program);
			this.program = -1;
    }
	}
}

export default class WebGLPrograms {
  programs: {[key: string]: WebGLProgramService};

  constructor(private renderer: Renderer, private extensions: WebGLExtensions, private capabilities: WebGLCapabilities) { }

  allocateBones(object: Outfit) {
    const skeleton = object.skeleton;
    const bones = skeleton.bones;
    if (this.capabilities.floatVertexTextures) {
      return 1024;
    } else {
      // default for when object is not specified
      // ( for example when prebuilding shader to be used with multiple objects )
      //
      //  - leave some extra space for other uniforms
      //  - limit here is ANGLE's 254 max uniform vectors
      //    (up to 54 should be safe)
      const nVertexUniforms = this.capabilities.maxVertexUniforms;
      const nVertexMatrices = Math.floor((nVertexUniforms - 20) / 4);
      const maxBones = Math.min(nVertexMatrices, bones.length);
      if (maxBones < bones.length) {
        console.warn('THREE.WebGLRenderer: Skeleton has ' + bones.length + ' bones. This GPU supports ' + maxBones + '.');
        return 0;
      }
      return maxBones;
    }
  }

  getTextureEncodingFromMap(map?: Texture, gammaOverrideLinear?: boolean) {
    let encoding: TextureEncoding = 'Linear';
    if (map) {
      encoding = map.encoding;
    }
    // add backwards compatibility for WebGLRenderer.gammaInput/gammaOutput parameter, should probably be removed at some point.
    if (encoding === 'Linear' && gammaOverrideLinear) {
      encoding = 'Gamma';
    }
    return encoding;
  }

  getParameters(material: Material, lights: WebGLLights, shadows: LightShadow[], fog?: Fog, nClipPlanes?: number, nClipIntersection?: number, object?: XObject) {
    // heuristics to create shader parameters according to lights in the scene
    // (not to blow over maxLights budget)
    const maxBones = object instanceof Outfit ? this.allocateBones(object) : 0;
    let precision = this.capabilities.precision;
    if (material.precision !== null) {
      precision = this.capabilities.getMaxPrecision(material.precision);
      if (precision !== material.precision) {
        console.warn('THREE.WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.');
      }
    }
    const currentRenderTarget = this.renderer.getRenderTarget();
    return {
      precision: precision,
      supportsVertexTextures: this.capabilities.vertexTextures,
      outputEncoding: this.getTextureEncodingFromMap((!currentRenderTarget) ? null : currentRenderTarget.texture, this.renderer.gammaOutput),
      mapKeys: Object.keys(material.maps),
      encodings: Object.values(material.maps).map(maps => this.getTextureEncodingFromMap(maps[0], this.renderer.gammaInput)),
      envMapMode: material.maps.envMap.mapping,
      envMapCubeUV: (!!material.envMap) && ((material.envMap.mapping === CubeUVReflectionMapping) || (material.envMap.mapping === CubeUVRefractionMapping)),
      objectSpaceNormalMap: material.normalMapType === ObjectSpaceNormalMap,
      combine: material.combine,
      vertexColors: material.vertexColors,
      fog: !!fog,
      useFog: material.fog,
      fogExp: (fog && fog instanceof FogExp2),
      flatShading: material.flatShading,
      sizeAttenuation: material.sizeAttenuation,
      logarithmicDepthBuffer: this.capabilities.logarithmicDepthBuffer,
      skinning: material.skinning && maxBones > 0,
      maxBones: maxBones,
      useVertexTexture: this.capabilities.floatVertexTextures,
      morphTargets: material.morphTargets,
      morphNormals: material.morphNormals,
      maxMorphTargets: this.renderer.maxMorphTargets,
      maxMorphNormals: this.renderer.maxMorphNormals,
      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,
      numClippingPlanes: nClipPlanes,
      numClipIntersection: nClipIntersection,
      dithering: material.dithering,
      shadowMapEnabled: this.renderer.shadowMap.enabled && object.receiveShadow && shadows.length > 0,
      shadowMapType: this.renderer.shadowMap.type,
      toneMapping: this.renderer.toneMapping,
      physicallyCorrectLights: renderer.physicallyCorrectLights,
      premultipliedAlpha: material.premultipliedAlpha,
      alphaTest: material.alphaTest,
      doubleSided: material.side === 'Double',
      flipSided: material.side === 'Back',
      depthPacking: material.depthPacking || false
    };
  }

  getProgram(material: Material, name: string) {
		if (this.programs[name] === undefined) {
			this.programs[name] = new WebGLProgramService(this.renderer.context, material, name);
		}
		this.programs[name].acquire();
		return this.programs[name];
  }
}
