/**
 * @author szimek / https://github.com/szimek/
 * @author alteredq / http://alteredqualia.com/
 * @author Marius Kintel / https://github.com/kintel
 */

/*
 In options, we can specify:
 * Texture parameters for an auto-generated target texture
 * depthBuffer/stencilBuffer: Booleans to indicate if we should generate these buffers
*/

import EventSource from '../../basis/EventSource';
import Vector4 from '../../basis/Vector4';
import Texture from '../../textures/Texture';
import { TextureWrapping, TextureFilter, TextureFormat, TextureDataType, TextureEncoding } from '../DrawTypes';

interface WebGLRenderTargetOptions {
  wrapS?: TextureWrapping;
  wrapT?: TextureWrapping;
  magFilter?: TextureFilter;
  minFilter?: TextureFilter;
  format?: TextureFormat;
  type?: TextureDataType;
  anisotropy?: number;
  encoding?: TextureEncoding;
  generateMipmaps?: boolean;
  depthBuffer?: boolean;
  stencilBuffer?: boolean;
  depthTexture?: Texture;
}

export default class WebGLRenderTarget extends EventSource {

  scissor: Vector4;
  scissorTest = false;
  viewport: Vector4;

  texture: Texture;
  depthBuffer: boolean;
  stencilBuffer: boolean;
  depthTexture: Texture | null;

  constructor(public width: number, public height: number, options: WebGLRenderTargetOptions = {}) {
    super();
    this.scissor = new Vector4(0, 0, width, height);
    this.viewport = new Vector4(0, 0, width, height);

    this.texture = new Texture(undefined, undefined, options.wrapS, options.wrapT, options.magFilter, options.minFilter || 'Linear', options.format, options.type, options.anisotropy, options.encoding);

    this.texture.generateMipmaps = options.generateMipmaps || false;

    this.depthBuffer = options.depthBuffer || true;
    this.stencilBuffer = options.stencilBuffer || true;
    this.depthTexture = options.depthTexture || null;

  }

  setSize(width: number, height: number) {

    if (this.width !== width || this.height !== height) {

      this.width = width;
      this.height = height;

      this.dispose();

    }

    this.viewport = new Vector4(0, 0, width, height);
    this.scissor = new Vector4(0, 0, width, height);

  }

  clone() {
    const newW = new WebGLRenderTarget(this.width, this.height);

    newW.viewport = this.viewport.clone();

    newW.texture = this.texture.clone();

    newW.depthBuffer = this.depthBuffer;
    newW.stencilBuffer = this.stencilBuffer;
    newW.depthTexture = this.depthTexture;

    return newW;
  }

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }

}
