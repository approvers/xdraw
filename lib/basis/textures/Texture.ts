/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {TextureDataType, TextureEncoding, TextureFilter, TextureFormat, TextureMapping, TextureWrapping} from '../../components/renderer/DrawTypes';
import {TypedArray} from '../BufferAttribute';
import Matrix3 from '../Matrix3';
import Vector2 from '../Vector2';

export default class Texture {
  name = '';
  mipmaps = [];

  offset = new Vector2(0, 0);
  repeat = new Vector2(1, 1);
  center = new Vector2(0, 0);
  rotation = 0;

  matrixAutoUpdate = true;
  matrix = new Matrix3();

  generateMipmaps = true;
  premultiplyAlpha = false;
  flipY = true;
  unpackAlignment: 1|2|4|8 =
      4;  // valid values: 1, 2, 4, 8 (see
          // http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)

  // Values of encoding !== THREE.LinearEncoding only supported on map, envMap
  // and emissiveMap.
  //
  // Also changing the encoding after already used by a Material will not
  // automatically make the Material update.  You need to explicitly call
  // Material.needsUpdate to trigger it to recompile.

  version = 0;
  onUpdate = null;

  constructor(
      private image: HTMLImageElement|HTMLCanvasElement|HTMLVideoElement|
      null = null,
      public readonly mapping: TextureMapping = 'UV',
      private wrapS = TextureWrapping.ClampToEdgeWrapping,
      private wrapT = TextureWrapping.ClampToEdgeWrapping,
      private magFilter: TextureFilter = 'Linear',
      private minFilter: TextureFilter = 'LinearMipMapLinear',
      private format: TextureFormat = 'RGBA',
      private type: TextureDataType = 'UnsignedByte', private anisotropy = 1,
      public encoding: TextureEncoding = 'Linear') {}

  updateMatrix() {
    this.matrix = Matrix3.fromUvTransform(
        this.offset.x, this.offset.y, this.repeat.x, this.repeat.y,
        this.rotation, this.center.x, this.center.y);
  }

  clone() {
    const newT = new Texture(
        this.image, this.mapping, this.wrapS, this.wrapT, this.magFilter,
        this.minFilter, this.format, this.type, this.anisotropy, this.encoding);

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

  toJSON(meta: any) {
    const isRootObject = (meta === undefined || typeof meta === 'string');

    if (!isRootObject && meta.textures[this.name] !== undefined) {
      return meta.textures[this.name];
    }

    const output = {

      metadata: {version: 4.5, type: 'Texture', generator: 'Texture.toJSON'},

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

  transformUv(uv: Vector2) {
    if (this.mapping !== 'UV') return uv;

    uv.applyMatrix3(this.matrix);

    if (uv.x < 0 || uv.x > 1) {
      switch (this.wrapS) {
        case TextureWrapping.RepeatWrapping:

          uv.x = uv.x - Math.floor(uv.x);
          break;

        case TextureWrapping.ClampToEdgeWrapping:

          uv.x = uv.x < 0 ? 0 : 1;
          break;

        case TextureWrapping.MirroredRepeatWrapping:

          if (Math.abs(Math.floor(uv.x) % 2) === 1) {
            uv.x = Math.ceil(uv.x) - uv.x;

          } else {
            uv.x = uv.x - Math.floor(uv.x);
          }
          break;
      }
    }

    if (uv.y < 0 || uv.y > 1) {
      switch (this.wrapT) {
        case TextureWrapping.RepeatWrapping:

          uv.y = uv.y - Math.floor(uv.y);
          break;

        case TextureWrapping.ClampToEdgeWrapping:

          uv.y = uv.y < 0 ? 0 : 1;
          break;

        case TextureWrapping.MirroredRepeatWrapping:

          if (Math.abs(Math.floor(uv.y) % 2) === 1) {
            uv.y = Math.ceil(uv.y) - uv.y;

          } else {
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

  set needsUpdate(value: boolean) {
    if (value === true) this.version++;
  }
}


export class DataTexture {
  constructor(
      public data: ArrayBuffer|TypedArray, public width: number,
      public height: number, public format?: TextureFormat,
      public type?: TextureDataType, public mapping?: TextureMapping,
      public wrapS?: TextureWrapping, public wrapT?: TextureWrapping,
      public magFilter?: TextureFilter, public minFilter?: TextureFilter,
      public anisotropy?: number, public encoding?: TextureEncoding) {}

  texture: Texture;
}
