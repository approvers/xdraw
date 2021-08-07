/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {
  TextureDataType,
  TextureEncoding,
  TextureFilter,
  TextureFormat,
  TextureMapping,
  TextureWrapping,
} from "../../components/renderer/DrawTypes";
import Matrix3 from "../Matrix3";
import { TypedArray } from "../BufferAttribute";
import Vector2 from "../Vector2";

export interface TextureOptions {
  readonly mapping: TextureMapping;
  wrapS: TextureWrapping;
  wrapT: TextureWrapping;
  magFilter: TextureFilter;
  minFilter: TextureFilter;
  format: TextureFormat;
  type: TextureDataType;
  anisotropy: number;
  encoding: TextureEncoding;
}

export default class Texture {
  name = "";

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

  /*
   * Valid values: 1, 2, 4, 8 (see
   * http://www.khronos.org/opengles/sdk/docs/man/xhtml/glPixelStorei.xml)
   */
  unpackAlignment: 1 | 2 | 4 | 8 = 4;

  /*
   * Values of encoding !== THREE.LinearEncoding only supported on map, envMap
   * and emissiveMap.
   *
   * Also changing the encoding after already used by a Material will not
   * automatically make the Material update.  You need to explicitly call
   * Material.needsUpdate to trigger it to recompile.
   */

  version = 0;

  onUpdate = null;

  constructor(
    private image:
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement
      | null = null,
    public options: TextureOptions = {
      mapping: "UV",
      wrapS: TextureWrapping.ClampToEdgeWrapping,
      wrapT: TextureWrapping.ClampToEdgeWrapping,
      magFilter: "Linear",
      minFilter: "LinearMipMapLinear",
      format: "RGBA",
      type: "UnsignedByte",
      anisotropy: 1,
      encoding: "Linear",
    },
  ) {}

  updateMatrix(): void {
    this.matrix = Matrix3.fromUvTransform({
      offset: this.offset,
      repeat: this.repeat,
      rotation: this.rotation,
      pivot: this.center,
    });
  }

  clone(): Texture {
    const newT = new Texture(this.image, { ...this.options });

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

  toJSON(meta: { textures: { [key: string]: unknown } }): unknown {
    const isRootObject = Boolean(meta) || typeof meta === "string";

    if (!isRootObject && meta.textures[this.name]) {
      return meta.textures[this.name];
    }

    const output = {
      metadata: {
        version: 4.5,
        type: "Texture",
        generator: "Texture.toJSON",
      },

      name: this.name,

      mapping: this.options.mapping,

      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,

      wrap: [this.options.wrapS, this.options.wrapT],

      format: this.options.format,
      type: this.options.type,
      encoding: this.options.encoding,

      minFilter: this.options.minFilter,
      magFilter: this.options.magFilter,
      anisotropy: this.options.anisotropy,

      flipY: this.flipY,

      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment,
    };

    if (!isRootObject) {
      meta.textures[this.name] = output;
    }

    return output;
  }

  transformUv(uv: Vector2): Vector2 {
    if (this.options.mapping !== "UV") {
      return uv;
    }

    uv.applyMatrix3(this.matrix);

    if (uv.x < 0 || uv.x > 1) {
      switch (this.options.wrapS) {
        case TextureWrapping.RepeatWrapping:
          uv.x -= Math.floor(uv.x);
          break;

        case TextureWrapping.ClampToEdgeWrapping:
          uv.x = uv.x < 0 ? 0 : 1;
          break;

        case TextureWrapping.MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.x) % 2) === 1) {
            uv.x = Math.ceil(uv.x) - uv.x;
          } else {
            uv.x -= Math.floor(uv.x);
          }
          break;
        default:
          break;
      }
    }

    if (uv.y < 0 || uv.y > 1) {
      switch (this.options.wrapT) {
        case TextureWrapping.RepeatWrapping:
          uv.y -= Math.floor(uv.y);
          break;

        case TextureWrapping.ClampToEdgeWrapping:
          uv.y = uv.y < 0 ? 0 : 1;
          break;

        case TextureWrapping.MirroredRepeatWrapping:
          if (Math.abs(Math.floor(uv.y) % 2) === 1) {
            uv.y = Math.ceil(uv.y) - uv.y;
          } else {
            uv.y -= Math.floor(uv.y);
          }
          break;
        default:
          break;
      }
    }

    if (this.flipY) {
      uv.y = 1 - uv.y;
    }

    return uv;
  }

  setNeedsUpdate(value: boolean): void {
    if (value === true) {
      this.version += 1;
    }
  }
}

export class DataTexture {
  constructor(
    public data: ArrayBuffer | TypedArray,
    public size: Vector2,
    public options: Partial<TextureOptions>,
  ) {}

  texture: Texture | null = null;
}
