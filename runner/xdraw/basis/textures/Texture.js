"use strict";
/**
  * @author mrdoob / http://mrdoob.com/
  * @author alteredq / http://alteredqualia.com/
  * @author szimek / https://github.com/szimek/
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = require("../Vector2");
const Matrix3_1 = require("../Matrix3");
const DrawTypes_1 = require("../../components/renderer/DrawTypes");
const EventSource_1 = require("../EventSource");
class Texture extends EventSource_1.default {
    constructor(image = null, mapping = 'UV', wrapS = DrawTypes_1.TextureWrapping.ClampToEdgeWrapping, wrapT = DrawTypes_1.TextureWrapping.ClampToEdgeWrapping, magFilter = 'Linear', minFilter = 'LinearMipMapLinear', format = 'RGBA', type = 'UnsignedByte', anisotropy = 1, encoding = 'Linear') {
        super();
        this.image = image;
        this.mapping = mapping;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.magFilter = magFilter;
        this.minFilter = minFilter;
        this.format = format;
        this.type = type;
        this.anisotropy = anisotropy;
        this.encoding = encoding;
        this.name = '';
        this.mipmaps = [];
        this.offset = new Vector2_1.default(0, 0);
        this.repeat = new Vector2_1.default(1, 1);
        this.center = new Vector2_1.default(0, 0);
        this.rotation = 0;
        this.matrixAutoUpdate = true;
        this.matrix = new Matrix3_1.default();
        this.generateMipmaps = true;
        this.premultiplyAlpha = false;
        this.flipY = true;
        this.unpackAlignment = 4; // valid values: 1, 2, 4, 8 (see http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
        // Values of encoding !== THREE.LinearEncoding only supported on map, envMap and emissiveMap.
        //
        // Also changing the encoding after already used by a Material will not automatically make the Material
        // update.  You need to explicitly call Material.needsUpdate to trigger it to recompile.
        this.version = 0;
        this.onUpdate = null;
    }
    updateMatrix() {
        this.matrix = Matrix3_1.default.fromUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
    }
    clone() {
        const newT = new Texture(this.image, this.mapping, this.wrapS, this.wrapT, this.magFilter, this.minFilter, this.format, this.type, this.anisotropy, this.encoding);
        newT.mipmaps = this.mipmaps.slice(0);
        newT.name = this.name;
        newT.offset = this.offset.clone();
        newT.repeat = this.repeat.clone();
        newT.center = this.center.clone();
        newT.rotation = this.rotation;
        newT.matrixAutoUpdate = this.matrixAutoUpdate;
        newT.matrix = this.matrix.clone();
        newT.generateMipmaps = this.generateMipmaps;
        newT.premultiplyAlpha = this.premultiplyAlpha;
        newT.flipY = this.flipY;
        newT.unpackAlignment = this.unpackAlignment;
        return newT;
    }
    toJSON(meta) {
        const isRootObject = (meta === undefined || typeof meta === 'string');
        if (!isRootObject && meta.textures[this.name] !== undefined) {
            return meta.textures[this.name];
        }
        const output = {
            metadata: {
                version: 4.5,
                type: 'Texture',
                generator: 'Texture.toJSON'
            },
            name: this.name,
            mapping: this.mapping,
            repeat: [this.repeat.x, this.repeat.y],
            offset: [this.offset.x, this.offset.y],
            center: [this.center.x, this.center.y],
            rotation: this.rotation,
            wrap: [this.wrapS, this.wrapT],
            format: this.format,
            type: this.type,
            encoding: this.encoding,
            minFilter: this.minFilter,
            magFilter: this.magFilter,
            anisotropy: this.anisotropy,
            flipY: this.flipY,
            premultiplyAlpha: this.premultiplyAlpha,
            unpackAlignment: this.unpackAlignment
        };
        if (!isRootObject) {
            meta.textures[this.name] = output;
        }
        return output;
    }
    dispose() {
        this.dispatchEvent({ type: 'dispose' });
    }
    transformUv(uv) {
        if (this.mapping !== 'UV')
            return uv;
        uv.applyMatrix3(this.matrix);
        if (uv.x < 0 || uv.x > 1) {
            switch (this.wrapS) {
                case DrawTypes_1.TextureWrapping.RepeatWrapping:
                    uv.x = uv.x - Math.floor(uv.x);
                    break;
                case DrawTypes_1.TextureWrapping.ClampToEdgeWrapping:
                    uv.x = uv.x < 0 ? 0 : 1;
                    break;
                case DrawTypes_1.TextureWrapping.MirroredRepeatWrapping:
                    if (Math.abs(Math.floor(uv.x) % 2) === 1) {
                        uv.x = Math.ceil(uv.x) - uv.x;
                    }
                    else {
                        uv.x = uv.x - Math.floor(uv.x);
                    }
                    break;
            }
        }
        if (uv.y < 0 || uv.y > 1) {
            switch (this.wrapT) {
                case DrawTypes_1.TextureWrapping.RepeatWrapping:
                    uv.y = uv.y - Math.floor(uv.y);
                    break;
                case DrawTypes_1.TextureWrapping.ClampToEdgeWrapping:
                    uv.y = uv.y < 0 ? 0 : 1;
                    break;
                case DrawTypes_1.TextureWrapping.MirroredRepeatWrapping:
                    if (Math.abs(Math.floor(uv.y) % 2) === 1) {
                        uv.y = Math.ceil(uv.y) - uv.y;
                    }
                    else {
                        uv.y = uv.y - Math.floor(uv.y);
                    }
                    break;
            }
        }
        if (this.flipY) {
            uv.y = 1 - uv.y;
        }
        return uv;
    }
    set needsUpdate(value) {
        if (value === true)
            this.version++;
    }
}
exports.default = Texture;
class DataTexture {
    constructor(data, width, height, format, type, mapping, wrapS, wrapT, magFilter, minFilter, anisotropy, encoding) {
        this.data = data;
        this.width = width;
        this.height = height;
        this.format = format;
        this.type = type;
        this.mapping = mapping;
        this.wrapS = wrapS;
        this.wrapT = wrapT;
        this.magFilter = magFilter;
        this.minFilter = minFilter;
        this.anisotropy = anisotropy;
        this.encoding = encoding;
    }
}
exports.DataTexture = DataTexture;
