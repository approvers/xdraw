import WebGLExtensions from './WebGLExtensions';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLCapabilities {
  isWebGL2: boolean;

  precision: 'highp' | 'mediump' | 'lowp';
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
    this.isWebGL2 = gl instanceof WebGL2RenderingContext;

    this.precision =
      parameters.precision !== undefined ? parameters.precision : 'highp';
    const maxPrecision = this.getMaxPrecision(this.precision);

    if (maxPrecision !== this.precision) {
      console.warn(
        'WebGLRenderer:', this.precision, 'not supported, using',
        maxPrecision, 'instead.');
      this.precision = maxPrecision;
    }

    this.logarithmicDepthBuffer = parameters.logarithmicDepthBuffer === true;

    this.maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);
    this.maxVertexTextures = gl.getParameter(gl.MAX_VERTEX_TEXTURE_IMAGE_UNITS);
    this.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    this.maxCubemapSize = gl.getParameter(gl.MAX_CUBE_MAP_TEXTURE_SIZE);

    this.maxAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.maxVertexUniforms = gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS);
    this.maxVaryings = gl.getParameter(gl.MAX_VARYING_VECTORS);
    this.maxFragmentUniforms = gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS);

    this.vertexTextures = this.maxVertexTextures > 0;
    this.floatFragmentTextures =
      this.isWebGL2 || !!extensions.get('OES_texture_float');
    this.floatVertexTextures = this.vertexTextures && this.floatFragmentTextures;
  }

  private maxAnisotropy = -1;
  getMaxAnisotropy() {
    if (-1 < this.maxAnisotropy) return this.maxAnisotropy;

    const extension = this.extensions.get('EXT_texture_filter_anisotropic');

    if (extension !== null) {
      this.maxAnisotropy =
        this.gl.getParameter(extension.MAX_TEXTURE_MAX_ANISOTROPY_EXT);

    } else {
      this.maxAnisotropy = 0;
    }

    return this.maxAnisotropy;
  }

  getMaxPrecision(precision: 'highp' | 'mediump' | 'lowp') {
    switch (precision) {
      case 'highp': {
        const vertPrecision = this.gl.getShaderPrecisionFormat(
          this.gl.VERTEX_SHADER, this.gl.HIGH_FLOAT);
        const fragPrecision = this.gl.getShaderPrecisionFormat(
          this.gl.FRAGMENT_SHADER, this.gl.HIGH_FLOAT);
        if (vertPrecision !== null && fragPrecision !== null &&
          vertPrecision.precision > 0 && fragPrecision.precision > 0)
          return 'highp';
      }

      case 'mediump': {
        const vertPrecision = this.gl.getShaderPrecisionFormat(
          this.gl.VERTEX_SHADER, this.gl.MEDIUM_FLOAT);
        const fragPrecision = this.gl.getShaderPrecisionFormat(
          this.gl.FRAGMENT_SHADER, this.gl.MEDIUM_FLOAT);
        if (vertPrecision !== null && fragPrecision !== null &&
          vertPrecision.precision > 0 && fragPrecision.precision > 0)
          return 'mediump';
      }
      default:
        return 'lowp';
    }
  }
}
