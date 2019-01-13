/**
 * @author RkEclair / https://github.com/RkEclair
 */

export type TraiangleDrawMode = 'Normal'|'Strip'|'Fan';
export type FaceSide = 'Front'|'BackSide'|'DoubleSide';
export type ToneMapping =
    |'None'|'Linear'|'Reinhard'|'Uncharted2'|'Cineon'|'ACESFilmic';
export type TextureFormat =|'Alpha'|'RGB'|'RGBA'|'Luminance'|'LuminanceAlpha'|
    'RGBE'|'Depth'|'DepthStencil'|'Red';
export enum TextureWrapping {
  RepeatWrapping = 1000,
  ClampToEdgeWrapping = 1001,
  MirroredRepeatWrapping = 1002
}
export type NumberType =|'UnsignedByte'|'Byte'|'Short'|'UnsignedShort'|'Int'|
    'UnsignedInt'|'Float'|'HalfFloat'|'UnsignedShort4444'|'UnsignedShort5551'|
    'UnsignedShort565'|'UnsignedInt248';
export type DepthFunc =|'Never'|'Always'|'Less'|'LessEqual'|'Equal'|
    'GreaterEqual'|'Greater'|'NotEqual';
export type CullFaceMode = 'None'|'Back'|'Front'|'FrontBack';
export type BlendMode =
    |'None'|'Normal'|'Additive'|'Subtractive'|'Multiply'|'Custom';
export enum BlendFunc {
  AddEquation = WebGLRenderingContext.FUNC_ADD,
  SubtractEquation = WebGLRenderingContext.FUNC_SUBTRACT,
  ReverseSubtractEquation = WebGLRenderingContext.FUNC_REVERSE_SUBTRACT,
  MinEquation = WebGL2RenderingContext.MIN,
  MaxEquation = WebGL2RenderingContext.MAX
}
export enum BlendFactor {
  ZeroFactor = WebGLRenderingContext.ZERO,
  OneFactor = WebGLRenderingContext.ONE,
  SrcColorFactor = WebGLRenderingContext.SRC_COLOR,
  OneMinusSrcColorFactor = WebGLRenderingContext.ONE_MINUS_SRC_COLOR,
  SrcAlphaFactor = WebGLRenderingContext.SRC_ALPHA,
  OneMinusSrcAlphaFactor = WebGLRenderingContext.ONE_MINUS_SRC_ALPHA,
  DstAlphaFactor = WebGLRenderingContext.DST_ALPHA,
  OneMinusDstAlphaFactor = WebGLRenderingContext.ONE_MINUS_DST_ALPHA,
  DstColorFactor = WebGLRenderingContext.DST_COLOR,
  OneMinusDstColorFactor = WebGLRenderingContext.ONE_MINUS_DST_COLOR,
  SrcAlphaSaturateFactor = WebGLRenderingContext.SRC_ALPHA_SATURATE
}
export enum TextureCompressionFormat {
  RGB_S3TC_DXT1_Format = 33776,
  RGBA_S3TC_DXT1_Format = 33777,
  RGBA_S3TC_DXT3_Format = 33778,
  RGBA_S3TC_DXT5_Format = 33779,
  RGB_PVRTC_4BPPV1_Format = 35840,
  RGB_PVRTC_2BPPV1_Format = 35841,
  RGBA_PVRTC_4BPPV1_Format = 35842,
  RGBA_PVRTC_2BPPV1_Format = 35843,
  RGB_ETC1_Format = 36196,
  RGBA_ASTC_4x4_Format = 37808,
  RGBA_ASTC_5x4_Format = 37809,
  RGBA_ASTC_5x5_Format = 37810,
  RGBA_ASTC_6x5_Format = 37811,
  RGBA_ASTC_6x6_Format = 37812,
  RGBA_ASTC_8x5_Format = 37813,
  RGBA_ASTC_8x6_Format = 37814,
  RGBA_ASTC_8x8_Format = 37815,
  RGBA_ASTC_10x5_Format = 37816,
  RGBA_ASTC_10x6_Format = 37817,
  RGBA_ASTC_10x8_Format = 37818,
  RGBA_ASTC_10x10_Format = 37819,
  RGBA_ASTC_12x10_Format = 37820,
  RGBA_ASTC_12x12_Format = 37821
}
