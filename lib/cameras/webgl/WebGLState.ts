import Vector4 from '../../basis/Vector4';
import {BlendFactor, BlendFunc, BlendMode, CullFaceMode, DepthFunc} from '../DrawTypes';

import WebGLCapabilities from './WebGLCapabilities';
import WebGLExtensions from './WebGLExtensions';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

class ColorBuffer {
  locked = false;

  color = new Vector4();
  currentColorMask = null;
  currentColorClear = new Vector4(0, 0, 0, 0);

  constructor(private gl: WebGLRenderingContext) {}

  setMask(colorMask) {
    if (this.currentColorMask !== colorMask && !this.locked) {
      this.gl.colorMask(colorMask, colorMask, colorMask, colorMask);
      this.currentColorMask = colorMask;
    }
  }

  setLocked(lock) {
    this.locked = lock;
  }

  setClear(r, g, b, a, premultipliedAlpha = false) {
    if (premultipliedAlpha === true) {
      r *= a;
      g *= a;
      b *= a;
    }

    this.color.set(r, g, b, a);

    if (this.currentColorClear.equals(this.color) === false) {
      this.gl.clearColor(r, g, b, a);
      this.currentColorClear = this.color.clone();
    }
  }

  reset() {
    this.locked = false;

    this.currentColorMask = null;
    this.currentColorClear.set(-1, 0, 0, 0);  // set to invalid state
  }
}

class DepthBuffer {
  locked = false;

  currentDepthMask = null;
  currentDepthFunc: DepthFunc = null;
  currentDepthClear = null;

  constructor(
      private gl: WebGLRenderingContext, private enable: Function,
      private disable: Function) {}

  setTest(depthTest) {
    if (depthTest) {
      this.enable(this.gl.DEPTH_TEST);
    } else {
      this.disable(this.gl.DEPTH_TEST);
    }
  }

  setMask(depthMask) {
    if (this.currentDepthMask !== depthMask && !this.locked) {
      this.gl.depthMask(depthMask);
      this.currentDepthMask = depthMask;
    }
  }

  setFunc(depthFunc: DepthFunc) {
    if (this.currentDepthFunc !== depthFunc) {
      switch (depthFunc) {
        case 'Never':
          this.gl.depthFunc(this.gl.NEVER);
          break;

        case 'Always':
          this.gl.depthFunc(this.gl.ALWAYS);
          break;

        case 'Less':
          this.gl.depthFunc(this.gl.LESS);
          break;

        case 'LessEqual':
          this.gl.depthFunc(this.gl.LEQUAL);
          break;

        case 'Equal':
          this.gl.depthFunc(this.gl.EQUAL);
          break;

        case 'GreaterEqual':
          this.gl.depthFunc(this.gl.GEQUAL);
          break;

        case 'Greater':
          this.gl.depthFunc(this.gl.GREATER);
          break;

        case 'NotEqual':
          this.gl.depthFunc(this.gl.NOTEQUAL);
          break;

        default:
          this.gl.depthFunc(this.gl.LEQUAL);
      }
      this.currentDepthFunc = depthFunc;
    }
  }

  setLocked(lock) {
    this.locked = lock;
  }

  setClear(depth) {
    if (this.currentDepthClear !== depth) {
      this.gl.clearDepth(depth);
      this.currentDepthClear = depth;
    }
  }

  reset() {
    this.locked = false;

    this.currentDepthMask = null;
    this.currentDepthFunc = null;
    this.currentDepthClear = null;
  }
}

class StencilBuffer {
  locked = false;

  currentStencilMask = null;
  currentStencilFunc = null;
  currentStencilRef = null;
  currentStencilFuncMask = null;
  currentStencilFail = null;
  currentStencilZFail = null;
  currentStencilZPass = null;
  currentStencilClear = null;

  constructor(
      private gl: WebGLRenderingContext, private enable: Function,
      private disable: Function) {}

  setTest(stencilTest) {
    if (stencilTest) {
      this.enable(this.gl.STENCIL_TEST);
    } else {
      this.disable(this.gl.STENCIL_TEST);
    }
  }

  setMask(stencilMask) {
    if (this.currentStencilMask !== stencilMask && !this.locked) {
      this.gl.stencilMask(stencilMask);
      this.currentStencilMask = stencilMask;
    }
  }

  setFunc(stencilFunc, stencilRef, stencilMask) {
    if (this.currentStencilFunc !== stencilFunc ||
        this.currentStencilRef !== stencilRef ||
        this.currentStencilFuncMask !== stencilMask) {
      this.gl.stencilFunc(stencilFunc, stencilRef, stencilMask);

      this.currentStencilFunc = stencilFunc;
      this.currentStencilRef = stencilRef;
      this.currentStencilFuncMask = stencilMask;
    }
  }

  setOp(stencilFail, stencilZFail, stencilZPass) {
    if (this.currentStencilFail !== stencilFail ||
        this.currentStencilZFail !== stencilZFail ||
        this.currentStencilZPass !== stencilZPass) {
      this.gl.stencilOp(stencilFail, stencilZFail, stencilZPass);

      this.currentStencilFail = stencilFail;
      this.currentStencilZFail = stencilZFail;
      this.currentStencilZPass = stencilZPass;
    }
  }

  setLocked(lock) {
    this.locked = lock;
  }

  setClear(stencil) {
    if (this.currentStencilClear !== stencil) {
      this.gl.clearStencil(stencil);
      this.currentStencilClear = stencil;
    }
  }

  reset() {
    this.locked = false;

    this.currentStencilMask = null;
    this.currentStencilFunc = null;
    this.currentStencilRef = null;
    this.currentStencilFuncMask = null;
    this.currentStencilFail = null;
    this.currentStencilZFail = null;
    this.currentStencilZPass = null;
    this.currentStencilClear = null;
  }
}

export default class WebGLState {
  colorBuffer: ColorBuffer;
  depthBuffer: DepthBuffer;
  stencilBuffer: StencilBuffer;

  private newAttributes: Uint8Array;
  private enabledAttributes: Uint8Array;
  private attributeDivisors: Uint8Array;

  private enabledCapabilities = {};

  constructor(
      private gl: WebGLRenderingContext, private extensions: WebGLExtensions,
      private capabilities: WebGLCapabilities) {
    this.colorBuffer = new ColorBuffer(gl);
    this.depthBuffer = new DepthBuffer(gl, this.enable, this.disable);
    this.stencilBuffer = new StencilBuffer(gl, this.enable, this.disable);

    const maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    this.newAttributes = new Uint8Array(maxVertexAttributes);
    this.enabledAttributes = new Uint8Array(maxVertexAttributes);
    this.attributeDivisors = new Uint8Array(maxVertexAttributes);

    this.maxTextures = gl.getParameter(gl.MAX_COMBINED_TEXTURE_IMAGE_UNITS);

    var version = 0;
    var glVersion = gl.getParameter(gl.VERSION);

    if (glVersion.indexOf('WebGL') !== -1) {
      version = parseFloat(/^WebGL\ ([0-9])/.exec(glVersion)[1]);
      this.lineWidthAvailable = version >= 1.0;
    } else if (glVersion.indexOf('OpenGL ES') !== -1) {
      version = parseFloat(/^OpenGL\ ES\ ([0-9])/.exec(glVersion)[1]);
      this.lineWidthAvailable = version >= 2.0;
    }

    const createTexture = (type, target, count) => {
      var data = new Uint8Array(
          4);  // 4 is required to match default unpack alignment of 4.
      var texture = gl.createTexture();

      this.gl.bindTexture(type, texture);
      this.gl.texParameteri(type, this.gl.TEXTURE_MIN_FILTER, this.gl.NEAREST);
      this.gl.texParameteri(type, this.gl.TEXTURE_MAG_FILTER, this.gl.NEAREST);

      for (var i = 0; i < count; i++) {
        this.gl.texImage2D(
            target + i, 0, this.gl.RGBA, 1, 1, 0, this.gl.RGBA,
            this.gl.UNSIGNED_BYTE, data);
      }

      return texture;
    };

    const emptyTextures = this.emptyTextures;
    emptyTextures[gl.TEXTURE_2D] =
        createTexture(gl.TEXTURE_2D, this.gl.TEXTURE_2D, 1);
    emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(
        gl.TEXTURE_CUBE_MAP, this.gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);

    // init

    this.colorBuffer.setClear(0, 0, 0, 1);
    this.depthBuffer.setClear(1);
    this.stencilBuffer.setClear(0);

    this.enable(gl.DEPTH_TEST);
    this.depthBuffer.setFunc('LessEqual');

    this.setFlipSided(false);
    this.setCullFace('Back');
    this.enable(gl.CULL_FACE);

    this.setBlending('None');
  }

  initAttributes() {
    this.newAttributes.forEach((e) => (e = 0));
  }

  enableAttribute(attribute) {
    this.enableAttributeAndDivisor(attribute, 0);
  }

  enableAttributeAndDivisor(attribute, meshPerAttribute) {
    this.newAttributes[attribute] = 1;

    if (this.enabledAttributes[attribute] === 0) {
      this.gl.enableVertexAttribArray(attribute);
      this.enabledAttributes[attribute] = 1;
    }

    if (this.attributeDivisors[attribute] !== meshPerAttribute) {
      var extension = this.capabilities.isWebGL2 ?
          this.gl :
          this.extensions.get('ANGLE_instanced_arrays');

      extension[this.capabilities.isWebGL2 ? 'vertexAttribDivisor' : 'vertexAttribDivisorANGLE'](
          attribute, meshPerAttribute);
      this.attributeDivisors[attribute] = meshPerAttribute;
    }
  }

  disableUnusedAttributes() {
    for (let i = 0; i < this.enabledAttributes.length; ++i) {
      if (this.enabledAttributes[i] !== this.newAttributes[i]) {
        this.gl.disableVertexAttribArray(i);
        this.enabledAttributes[i] = 0;
      }
    }
  }

  enable(id) {
    if (this.enabledCapabilities[id] !== true) {
      this.gl.enable(id);
      this.enabledCapabilities[id] = true;
    }
  }

  disable(id) {
    if (this.enabledCapabilities[id] !== false) {
      this.gl.disable(id);
      this.enabledCapabilities[id] = false;
    }
  }

  private compressedTextureFormats = [];

  getCompressedTextureFormats() {
    if (this.extensions.get('WEBGL_compressed_texture_pvrtc') ||
        this.extensions.get('WEBGL_compressed_texture_s3tc') ||
        this.extensions.get('WEBGL_compressed_texture_etc1') ||
        this.extensions.get('WEBGL_compressed_texture_astc')) {
      const formats = this.gl.getParameter(this.gl.COMPRESSED_TEXTURE_FORMATS);
      formats.forEach((e) => this.compressedTextureFormats.push(e));
    }
    return this.compressedTextureFormats;
  }

  private currentProgram: WebGLProgram;

  useProgram(program) {
    if (this.currentProgram !== program) {
      this.gl.useProgram(program);
      this.currentProgram = program;
      return true;
    }
    return false;
  }

  private currentBlendingEnabled = false;
  private currentBlending: BlendMode;
  private currentBlendEquation: BlendFunc;
  private currentBlendSrc: BlendFactor;
  private currentBlendDst: BlendFactor;
  private currentBlendEquationAlpha: BlendFunc;
  private currentBlendSrcAlpha: BlendFactor;
  private currentBlendDstAlpha: BlendFactor;
  private currentPremultipledAlpha = false;

  setBlending(
      blending: BlendMode = 'None',
      blendEquation: BlendFunc = BlendFunc.AddEquation,
      blendSrc: BlendFactor = BlendFactor.OneFactor,
      blendDst: BlendFactor = BlendFactor.OneFactor,
      blendEquationAlpha: BlendFunc = BlendFunc.AddEquation,
      blendSrcAlpha: BlendFactor = BlendFactor.OneFactor,
      blendDstAlpha: BlendFactor = BlendFactor.OneFactor,
      premultipliedAlpha: boolean = false) {
    if (blending === 'None') {
      if (this.currentBlendingEnabled) {
        this.disable(this.gl.BLEND);
        this.currentBlendingEnabled = false;
      }

      return;
    }

    if (!this.currentBlendingEnabled) {
      this.enable(this.gl.BLEND);
      this.currentBlendingEnabled = true;
    }

    if (blending !== 'Custom') {
      if (blending !== this.currentBlending ||
          premultipliedAlpha !== this.currentPremultipledAlpha) {
        if (this.currentBlendEquation !== BlendFunc.AddEquation ||
            this.currentBlendEquationAlpha !== BlendFunc.AddEquation) {
          this.gl.blendEquation(this.gl.FUNC_ADD);

          this.currentBlendEquation = BlendFunc.AddEquation;
          this.currentBlendEquationAlpha = BlendFunc.AddEquation;
        }

        if (premultipliedAlpha) {
          switch (blending) {
            case 'Normal':
              this.gl.blendFuncSeparate(
                  this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE,
                  this.gl.ONE_MINUS_SRC_ALPHA);
              break;

            case 'Additive':
              this.gl.blendFunc(this.gl.ONE, this.gl.ONE);
              break;

            case 'Subtractive':
              this.gl.blendFuncSeparate(
                  this.gl.ZERO, this.gl.ZERO, this.gl.ONE_MINUS_SRC_COLOR,
                  this.gl.ONE_MINUS_SRC_ALPHA);
              break;

            case 'Multiply':
              this.gl.blendFuncSeparate(
                  this.gl.ZERO, this.gl.SRC_COLOR, this.gl.ZERO,
                  this.gl.SRC_ALPHA);
              break;

            default:
              console.error('Invalid blending: ', blending);
              break;
          }
        } else {
          switch (blending) {
            case 'Normal':
              this.gl.blendFuncSeparate(
                  this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA, this.gl.ONE,
                  this.gl.ONE_MINUS_SRC_ALPHA);
              break;

            case 'Additive':
              this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
              break;

            case 'Subtractive':
              this.gl.blendFunc(this.gl.ZERO, this.gl.ONE_MINUS_SRC_COLOR);
              break;

            case 'Multiply':
              this.gl.blendFunc(this.gl.ZERO, this.gl.SRC_COLOR);
              break;

            default:
              console.error('Invalid blending: ', blending);
              break;
          }
        }

        this.currentBlendSrc = null;
        this.currentBlendDst = null;
        this.currentBlendSrcAlpha = null;
        this.currentBlendDstAlpha = null;

        this.currentBlending = blending;
        this.currentPremultipledAlpha = premultipliedAlpha;
      }
      return;
    }

    // custom blending

    blendEquationAlpha = blendEquationAlpha || blendEquation;
    blendSrcAlpha = blendSrcAlpha || blendSrc;
    blendDstAlpha = blendDstAlpha || blendDst;

    if (blendEquation !== this.currentBlendEquation ||
        blendEquationAlpha !== this.currentBlendEquationAlpha) {
      this.gl.blendEquationSeparate(blendEquation, blendEquationAlpha);

      this.currentBlendEquation = blendEquation;
      this.currentBlendEquationAlpha = blendEquationAlpha;
    }

    if (blendSrc !== this.currentBlendSrc ||
        blendDst !== this.currentBlendDst ||
        blendSrcAlpha !== this.currentBlendSrcAlpha ||
        blendDstAlpha !== this.currentBlendDstAlpha) {
      this.gl.blendFuncSeparate(
          blendSrc, blendDst, blendSrcAlpha, blendDstAlpha);

      this.currentBlendSrc = blendSrc;
      this.currentBlendDst = blendDst;
      this.currentBlendSrcAlpha = blendSrcAlpha;
      this.currentBlendDstAlpha = blendDstAlpha;
    }

    this.currentBlending = blending;
    this.currentPremultipledAlpha = null;
  }

  setMaterial(material, frontFaceCW) {
    if (material.side === 'Double')
      this.disable(this.gl.CULL_FACE);
    else
      this.enable(this.gl.CULL_FACE);

    let flipSided = material.side === 'Back';
    if (frontFaceCW) flipSided = !flipSided;

    this.setFlipSided(flipSided);

    material.blending === 'Normal' && material.transparent === false ?
        this.setBlending('None') :
        this.setBlending(
            material.blending, material.blendEquation, material.blendSrc,
            material.blendDst, material.blendEquationAlpha,
            material.blendSrcAlpha, material.blendDstAlpha,
            material.premultipliedAlpha);

    this.depthBuffer.setFunc(material.depthFunc);
    this.depthBuffer.setTest(material.depthTest);
    this.depthBuffer.setMask(material.depthWrite);
    this.colorBuffer.setMask(material.colorWrite);

    this.setPolygonOffset(
        material.polygonOffset, material.polygonOffsetFactor,
        material.polygonOffsetUnits);
  }

  private currentFlipSided = false;

  setFlipSided(flipSided: boolean) {
    if (this.currentFlipSided !== flipSided) {
      if (flipSided) {
        this.gl.frontFace(this.gl.CW);
      } else {
        this.gl.frontFace(this.gl.CCW);
      }

      this.currentFlipSided = flipSided;
    }
  }

  private currentCullFace: CullFaceMode;

  setCullFace(cullFace: CullFaceMode) {
    if (cullFace !== 'None') {
      this.enable(this.gl.CULL_FACE);

      if (cullFace !== this.currentCullFace) {
        if (cullFace === 'Back') {
          this.gl.cullFace(this.gl.BACK);
        } else if (cullFace === 'Front') {
          this.gl.cullFace(this.gl.FRONT);
        } else {
          this.gl.cullFace(this.gl.FRONT_AND_BACK);
        }
      }
    } else {
      this.disable(this.gl.CULL_FACE);
    }

    this.currentCullFace = cullFace;
  }

  private currentLineWidth: number;
  private lineWidthAvailable = false;

  setLineWidth(width) {
    if (width !== this.currentLineWidth) {
      if (this.lineWidthAvailable) this.gl.lineWidth(width);

      this.currentLineWidth = width;
    }
  }

  private currentPolygonOffsetFactor: number;
  private currentPolygonOffsetUnits: number;

  setPolygonOffset(hasPolygonOffset: boolean, factor: number, units: number) {
    if (hasPolygonOffset) {
      this.enable(this.gl.POLYGON_OFFSET_FILL);

      if (this.currentPolygonOffsetFactor !== factor ||
          this.currentPolygonOffsetUnits !== units) {
        this.gl.polygonOffset(factor, units);

        this.currentPolygonOffsetFactor = factor;
        this.currentPolygonOffsetUnits = units;
      }
    } else {
      this.disable(this.gl.POLYGON_OFFSET_FILL);
    }
  }

  setScissorTest(scissorTest: boolean) {
    if (scissorTest) {
      this.enable(this.gl.SCISSOR_TEST);
    } else {
      this.disable(this.gl.SCISSOR_TEST);
    }
  }

  // texture

  private maxTextures = 0;
  private currentTextureSlot = -1;
  private currentBoundTextures = {};
  private emptyTextures = {};

  activeTexture(webglSlot: number = this.gl.TEXTURE0 + this.maxTextures - 1) {
    if (this.currentTextureSlot !== webglSlot) {
      this.gl.activeTexture(webglSlot);
      this.currentTextureSlot = webglSlot;
    }
  }

  bindTexture(webglType, webglTexture: WebGLTexture) {
    if (this.currentTextureSlot === null) {
      this.activeTexture();
    }

    let boundTexture = this.currentBoundTextures[this.currentTextureSlot];

    if (boundTexture === undefined) {
      boundTexture = {type: undefined, texture: undefined};
      this.currentBoundTextures[this.currentTextureSlot] = boundTexture;
    }

    if (boundTexture.type !== webglType ||
        boundTexture.texture !== webglTexture) {
      this.gl.bindTexture(
          webglType, webglTexture || this.emptyTextures[webglType]);

      boundTexture.type = webglType;
      boundTexture.texture = webglTexture;
    }
  }

  compressedTexImage2D() {
    try {
      this.gl.compressedTexImage2D.apply(this.gl, arguments);
    } catch (error) {
      console.error('THREE.WebGLState:', error);
    }
  }

  texImage2D() {
    try {
      this.gl.texImage2D.apply(this.gl, arguments);
    } catch (error) {
      console.error('THREE.WebGLState:', error);
    }
  }

  private currentScissor = new Vector4();

  scissor(scissor) {
    if (this.currentScissor.equals(scissor) === false) {
      this.gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
      this.currentScissor = scissor.clone();
    }
  }

  private currentViewport = new Vector4();

  viewport(viewport) {
    if (this.currentViewport.equals(viewport) === false) {
      this.gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
      this.currentViewport = viewport.clone();
    }
  }

  reset() {
    for (let i = 0; i < this.enabledAttributes.length; i++) {
      if (this.enabledAttributes[i] === 1) {
        this.gl.disableVertexAttribArray(i);
        this.enabledAttributes[i] = 0;
      }
    }

    this.enabledCapabilities = {};

    this.compressedTextureFormats = null;

    this.currentTextureSlot = null;
    this.currentBoundTextures = {};

    this.currentProgram = null;

    this.currentBlending = null;

    this.currentFlipSided = null;
    this.currentCullFace = null;

    this.stencilBuffer.reset();
    this.depthBuffer.reset();
    this.colorBuffer.reset();
  }
}
