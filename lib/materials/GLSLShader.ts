import Uniforms from './Uniforms';

export default class GLSLShader {
  defines = {};
  uniforms = new Uniforms();

  vertexShader =
      'void main() {\n\tgl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );\n}';
  fragmentShader =
      'void main() {\n\tgl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );\n}';

  linewidth = 1;

  wireframe = false;
  wireframeLinewidth = 1;

  fog = false;       // set to use scene fog
  lights = false;    // set to use scene lights
  clipping = false;  // set to use user-defined clipping planes

  skinning = false;      // set to use skinning attribute streams
  morphTargets = false;  // set to use morph targets
  morphNormals = false;  // set to use morph normals

  extensions = {
    derivatives: false,      // set to use derivatives
    fragDepth: false,        // set to use fragment depth values
    drawBuffers: false,      // set to use draw buffers
    shaderTextureLOD: false  // set to use shader texture LOD
  };

  // When rendered geometry doesn't include these attributes but the material
  // does, use these default values in WebGL. avoids errors when buffer
  // data is missing.
  defaultAttributeValues = {'color': [1, 1, 1], 'uv': [0, 0], 'uv2': [0, 0]};

  index0AttributeName = undefined;
  uniformsNeedUpdate = false;

  clone() {
    const newM = new GLSLShader();

    newM.fragmentShader = this.fragmentShader;
    newM.vertexShader = this.vertexShader;

    newM.uniforms = this.uniforms.clone();

    newM.defines = {...this.defines};

    newM.wireframe = this.wireframe;
    newM.wireframeLinewidth = this.wireframeLinewidth;

    newM.lights = this.lights;
    newM.clipping = this.clipping;

    newM.skinning = this.skinning;

    newM.morphTargets = this.morphTargets;
    newM.morphNormals = this.morphNormals;

    newM.extensions = this.extensions;

    return newM;
  }

  toJSON() {
    throw new Error('Not implemented');
  }
}
