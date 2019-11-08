/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export type TraiangleDrawMode = 'Normal' | 'Strip' | 'Fan';
export type FaceSide = 'Front' | 'Back' | 'Double';
export type ToneMapping =
  |'None' | 'Linear' | 'Reinhard' | 'Uncharted2' | 'Cineon' | 'ACESFilmic';
export type TextureEncoding = 'Linear' | 'sRGB' | 'Gamma' | 'RGBE' | 'LogLuv' | 'RGBM7' | 'RGBM16' | 'RGBD';
export type TextureFilter = 'Nearest' | 'NearestMipMapNearest' | 'NearestMipMapLinear' | 'Linear' | 'LinearMipMapNearest' | 'LinearMipMapLinear';
export type TextureFormat = |'Alpha' | 'RGB' | 'RGBA' | 'Luminance' | 'LuminanceAlpha' |
  'RGBE' | 'Depth' | 'DepthStencil' | 'Red';
export enum TextureWrapping {
  RepeatWrapping = 1000,
  ClampToEdgeWrapping = 1001,
  MirroredRepeatWrapping = 1002
}
export type TextureMapping = 'UV' | 'CubeReflection' | 'CubeRefraction' | 'EquirectangularReflection' | 'EquirectangularRefraction' | 'SphericalReflection' | 'CubeUVReflection' | 'CubeUVRefraction';
export type TextureDataType = |'UnsignedByte' | 'Byte' | 'Short' | 'UnsignedShort' | 'Int' |
  'UnsignedInt' | 'Float' | 'HalfFloat';
export type PixekType = 'UnsignedShort4444' | 'UnsignedShort5551' |
  'UnsignedShort565' | 'UnsignedInt248';
export type DepthFunc = |'Never' | 'Always' | 'Less' | 'LessEqual' | 'Equal' |
  'GreaterEqual' | 'Greater' | 'NotEqual';
export type CullFaceMode = 'None' | 'Back' | 'Front' | 'FrontBack';
export type BlendMode =
  |'None' | 'Normal' | 'Additive' | 'Subtractive' | 'Multiply' | 'Custom';
export type BlendFunc = 'Add' | 'Sub' | 'ReverseSub' | 'Min' | 'Max';
export type BlendFactor = '0' | '1' | 'SrcColor' | '1-SrcColor' | 'SrcAlpha' | '1-SrcAlpha' | 'DstColor' | '1-DstColor' | 'DstAlpha' | '1-DstAlpha' | 'SrcAlphaSaturate';
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
export type CombineOperation = 'Multiply' | 'Mix' | 'Add';
export type NormalMapType = 'TangentSpace' | 'ObjectSpace';
