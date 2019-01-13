import WebGLExtensions from './WebGLExtensions';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLCapabilities {
  isWebGL2: boolean;

  precision: 'highp'|'mediump'|'lowp';
  logarithmicDepthBuffer: boolean;

  maxTextures: any;
  maxVertexTextures: any;
  maxTextureSize: any;
  maxCubemapSize: any;

  maxAttributes: any;
  maxVertexUniforms: any;
  maxVaryings: any;
  maxFragmentUniforms: any;

  vertexTextures: any;
  floatFragmentTextures: any;
  floatVertexTextures: any;
  constructor(
      private gl: WebGLRenderingContext, private extensions: WebGLExtensions,
      parameters) {
    var isWebGL2 = gl instanceof WebGL2RenderingContext;

    var precision =
        parameters.precision !== undefined ? parameters.precision : 'highp';
    var maxPrecision = this.getMaxPrecision(precision);

    if (maxPrecision !== precision) {
      console.warn(
          'THREE.WebGLRenderer:', precision, 'not supported, using',
          maxPrecision, 'instead.');
      precision = maxPrecision;
    }

    var logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

    var maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    var maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    var maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    var maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    var maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    var maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    var maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    var maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    var vertexTextures = maxVertexTextures > 0;
    var floatFragmentTextures =
        isWebGL2 || !!extensions.get('OES_texture_float');
    var floatVertexTextures = vertexTextures && floatFragmentTextures;
  }

  private maxAnisotropy = null;
  getMaxAnisotropy() {
    if (this.maxAnisotropy !== null) return this.maxAnisotropy;

    var extension = this.extensions.get('EXT_texture_filter_anisotropic');

    if (extension !== null) {
      this.maxAnisotropy =
          this.gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

    } else {
      this.maxAnisotropy = 0;
    }

    return this.maxAnisotropy;
  }

  getMaxPrecision(precision) {
    if (precision === 'highp') {
      if (this.gl.getShaderPrecisionFormat(
                     this.gl.VERTEX_SHADER, this.gl.HIGH_FLOAT)
                  .precision > 0 &&
          this.gl.getShaderPrecisionFormat(
                     this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT)
                  .precision > 0) {
        return 'highp';
      }

      precision = 'mediump';
    }

    if (precision === 'mediump') {
      if (this.gl.getShaderPrecisionFormat(
                     this.gl.VERTEX_SHADER, this.gl.MEDIUM_FLOAT)
                  .precision > 0 &&
          this.gl.getShaderPrecisionFormat(
                     this.gl.FRAGMENT_SHADER, this.gl.MEDIUM_FLOAT)
                  .precision > 0) {
        return 'mediump';
      }
    }

    return 'lowp';
  }
}
