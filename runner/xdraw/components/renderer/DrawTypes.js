"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
var TextureWrapping;
(function (TextureWrapping) {
    TextureWrapping[TextureWrapping["RepeatWrapping"] = 1000] = "RepeatWrapping";
    TextureWrapping[TextureWrapping["ClampToEdgeWrapping"] = 1001] = "ClampToEdgeWrapping";
    TextureWrapping[TextureWrapping["MirroredRepeatWrapping"] = 1002] = "MirroredRepeatWrapping";
})(TextureWrapping = exports.TextureWrapping || (exports.TextureWrapping = {}));
var TextureCompressionFormat;
(function (TextureCompressionFormat) {
    TextureCompressionFormat[TextureCompressionFormat["RGB_S3TC_DXT1_Format"] = 33776] = "RGB_S3TC_DXT1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_S3TC_DXT1_Format"] = 33777] = "RGBA_S3TC_DXT1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_S3TC_DXT3_Format"] = 33778] = "RGBA_S3TC_DXT3_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_S3TC_DXT5_Format"] = 33779] = "RGBA_S3TC_DXT5_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGB_PVRTC_4BPPV1_Format"] = 35840] = "RGB_PVRTC_4BPPV1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGB_PVRTC_2BPPV1_Format"] = 35841] = "RGB_PVRTC_2BPPV1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_PVRTC_4BPPV1_Format"] = 35842] = "RGBA_PVRTC_4BPPV1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_PVRTC_2BPPV1_Format"] = 35843] = "RGBA_PVRTC_2BPPV1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGB_ETC1_Format"] = 36196] = "RGB_ETC1_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_4x4_Format"] = 37808] = "RGBA_ASTC_4x4_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_5x4_Format"] = 37809] = "RGBA_ASTC_5x4_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_5x5_Format"] = 37810] = "RGBA_ASTC_5x5_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_6x5_Format"] = 37811] = "RGBA_ASTC_6x5_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_6x6_Format"] = 37812] = "RGBA_ASTC_6x6_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_8x5_Format"] = 37813] = "RGBA_ASTC_8x5_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_8x6_Format"] = 37814] = "RGBA_ASTC_8x6_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_8x8_Format"] = 37815] = "RGBA_ASTC_8x8_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_10x5_Format"] = 37816] = "RGBA_ASTC_10x5_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_10x6_Format"] = 37817] = "RGBA_ASTC_10x6_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_10x8_Format"] = 37818] = "RGBA_ASTC_10x8_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_10x10_Format"] = 37819] = "RGBA_ASTC_10x10_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_12x10_Format"] = 37820] = "RGBA_ASTC_12x10_Format";
    TextureCompressionFormat[TextureCompressionFormat["RGBA_ASTC_12x12_Format"] = 37821] = "RGBA_ASTC_12x12_Format";
})(TextureCompressionFormat = exports.TextureCompressionFormat || (exports.TextureCompressionFormat = {}));
