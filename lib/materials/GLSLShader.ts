/**
  * @author RkEclair / https://github.com/RkEclair
  */

import Material, { MaterialOptions } from './Material';
import { WebGLProgramService } from '../cameras/webgl/WebGLPrograms';

export interface Shader {
  uniforms: { [location: string]: Float32Array | Int32Array; };
  vertexShader: string;
  fragmentShader: string;
};

interface GLSLShaderOptions extends MaterialOptions {
  defines?: any;
  shader?: Shader;

  linewidth?: number;

  wireframe?: boolean;
  wireframeLinewidth?: number;

  fog?: boolean;       // set to use scene fog
  lights?: boolean;    // set to use scene lights
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

export default class GLSLShader extends Material {
  defines = {};

  linewidth = 1;

  wireframe = false;
  wireframeLinewidth = 1;

  fog = false; // set to use scene fog
  lights = false; // set to use scene lights
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

  constructor(options: GLSLShaderOptions) {
    super(options);
    (Object as any).assign(this, options);
  }

  clone() {
    const newM = new GLSLShader({});
    (Object as any).assign(newM, this);

    newM.shader = { ...this.shader };
    newM.defines = { ...this.defines };

    return newM;
  }

  toJSON() {
    throw new Error('Not implemented');
  }

  refreshUniforms(program: WebGLProgramService) {
    const uniforms = program.uniforms;
    this.shader.uniforms.forEach(e => {
      uniforms.update(e);
    });
  }
}
