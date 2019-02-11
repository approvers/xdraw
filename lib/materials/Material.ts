/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import EventSource from '../basis/EventSource';
import { BlendMode, FaceSide, BlendFactor, BlendFunc, DepthFunc } from '../cameras/DrawTypes';
import Texture from '../textures/Texture';
import { WebGLProgramService } from '../cameras/webgl/WebGLPrograms';
import Mesh from '../meshes/Mesh';

export interface Shader {
  uniforms: { [location: string]: Float32Array | Int32Array; };
  vertexShader: string;
  fragmentShader: string;
};

export interface MaterialPropertiesOptions {
  name?: string;

  fog?: boolean;
  lights?: boolean;

  blending?: BlendMode;
  side?: FaceSide;
  flatShading?: boolean;
  vertexColors?: 'None' | 'Vertex' | 'Face';

  opacity?: number;
  transparent?: boolean;

  blendSrc?: BlendFactor;
  blendDst?: BlendFactor;
  blendEquation?: BlendFunc;
  blendSrcAlpha?: BlendFactor;
  blendDstAlpha?: BlendFactor;
  blendEquationAlpha?: BlendFunc;

  depthFunc?: DepthFunc;
  depthTest?: boolean;
  depthWrite?: boolean;

  clippingPlanes?: any[];
  clipIntersection?: boolean;
  clipShadows?: boolean;

  shadowSide?: FaceSide;

  colorWrite?: boolean;

  precision?: string;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  polygonOffsetUnits?: number;

  dithering?: boolean;

  alphaTest?: number;
  premultipliedAlpha?: boolean;

  visible?: boolean;

  defines?: any;
  shader?: Shader;

  linewidth?: number;

  wireframe?: boolean;
  wireframeLinewidth?: number;

  clipping?: boolean;  // set to use user-defined clipping planes

  skinning?: boolean;      // set to use skinning attribute streams
  morphTargets?: boolean;  // set to use morph targets
  morphNormals?: boolean;  // set to use morph normals

  extensions?: {
    derivatives?: false,      // set to use derivatives
    fragDepth?: false,        // set to use fragment depth values
    drawBuffers?: false,      // set to use draw buffers
    shaderTextureLOD?: false  // set to use shader texture LOD
  };

  index0AttributeName?: string;
  uniformsNeedUpdate?: boolean;
};

type MaterialPropertiesUniform = {
  value: any;
};

type MaterialPropertiesAttribute = {
  buffer: Mesh;
};

let globalId = 0;

export class MaterialProperties extends EventSource {
  id: number;
  name = '';

  fog = true;
  lights = true;

  blending: BlendMode = 'Normal';
  side: FaceSide = 'Front';
  flatShading = false;
  vertexColors: 'None' | 'Vertex' | 'Face' = 'None';

  opacity = 1;
  transparent = false;

  blendSrc = BlendFactor.SrcAlphaFactor;
  blendDst = BlendFactor.OneMinusSrcAlphaFactor;
  blendEquation = BlendFunc.AddEquation;
  blendSrcAlpha: BlendFactor;
  blendDstAlpha: BlendFactor;
  blendEquationAlpha: BlendFunc;

  depthFunc: DepthFunc = 'LessEqual';
  depthTest = true;
  depthWrite = true;

  clippingPlanes = null;
  clipIntersection = false;
  clipShadows = false;

  shadowSide = null;

  colorWrite = true;

  precision: 'highp' | 'mediump' | 'lowp'; // override the renderer's default precision for this material
  maps: { [name: string]: Texture[] };

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  dithering = false;

  alphaTest = 0;
  premultipliedAlpha = false;

  visible = true;

  shader: {
    uniforms:
    { [name: string]: MaterialPropertiesUniform };
    attributes:
    { [name: string]: MaterialPropertiesAttribute };
    vertexShader: string;
    fragmentShader: string;
  };

  userData = {};

  needsUpdate = true;
  defines = {};

  linewidth = 1;

  wireframe = false;
  wireframeLinewidth = 1;

  clipping = false; // set to use user-defined clipping planes

  skinning = false; // set to use skinning attribute streams
  morphTargets = false; // set to use morph targets
  morphNormals = false; // set to use morph normals

  extensions = {
    derivatives: false, // set to use derivatives
    fragDepth: false, // set to use fragment depth values
    drawBuffers: false, // set to use draw buffers
    shaderTextureLOD: false // set to use shader texture LOD
  };

  // When rendered geometry doesn't include these attributes but the material does,
  // use these default values in WebGL. This avoids errors when buffer data is missing.
  static defaultAttributeValues = {
    'color': [1, 1, 1],
    'uv': [0, 0],
    'uv2': [0, 0]
  };

  index0AttributeName = undefined;
  uniformsNeedUpdate = false;


  constructor(options: MaterialPropertiesOptions) {
    super();
    (Object as any).assign(this, options);
    this.id = globalId++;
  }

  addAttribute(key: string, attribute: MaterialPropertiesAttribute) {
    this.shader.attributes[key] = attribute;
  }

  getAttribute(key: string) {
    return this.shader.uniforms.attributes[key];
  }

  addUniform(key: string, uniform: MaterialPropertiesUniform) {
    this.shader.uniforms[key] = uniform;
  }

  refreshUniforms(program: WebGLProgramService) {
    const uniforms = program.uniforms;
    Object.keys(this.shader.uniforms).forEach(key => {
      const value = this.shader.uniforms[key];
      uniforms.update(key, value);
    });
  }
};

export default interface Material {
  props: MaterialProperties;
}
