/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Color from '../../basis/Color';
import GLSLShader from '../../materials/GLSLShader';
import Renderer from '../Renderer';
import WebGLState from './WebGLState';
import WebGLObjects from './WebGLObjects';
import Model from '../../objects/Model';
import Camera from '../Camera';

export default class WebGLBackground {
  clearColor = new Color(0x000000);
  clearAlpha = 0;

  planeModel: Model = null;
  boxModel: Model = null;

  // Store the current background texture and its `version`
  // so we can recompile the material accordingly.
  currentBackground = null;
  currentBackgroundVersion = 0;

  constructor(
    private renderer: Renderer, private state: WebGLState,
    private objects: WebGLObjects, private premultipliedAlpha: boolean) { }

  render(renderList, scene, camera, forceClear) {
    const background = scene.background;
    let {
      clearColor,
      clearAlpha,
      planeModel,
      boxModel,
      currentBackground,
      currentBackgroundVersion,
      renderer,
      objects
    } = this;

    if (background === null) {
      this.setClear(clearColor, clearAlpha);
      currentBackground = null;
      currentBackgroundVersion = 0;
    } else if (background && background.isColor) {
      this.setClear(background, 1);
      forceClear = true;
      currentBackground = null;
      currentBackgroundVersion = 0;
    }

    if (renderer.autoClear || forceClear) {
      renderer.clear(
        renderer.autoClearColor, renderer.autoClearDepth,
        renderer.autoClearStencil);
    }

    if (background &&
      (background.isCubeTexture || background.isWebGLRenderTargetCube)) {
      if (boxModel === null) {
        boxModel = Model.cube();

        boxModel.mesh.removeAttribute('normal');
        boxModel.mesh.removeAttribute('uv');

        boxModel.addEventListener('beforeRender', (_renderer: any, _scene: any, camera: Camera) => {
          boxModel.transform.matrixWorld = camera.matrixWorld.clone();
        });

        // enable code injection for non-built-in material
        Object.defineProperty(boxModel.material, 'map', {
          get: function() {
            return this.uniforms.tCube.value;
          }
        });

        objects.update(boxModel);
      }

      if (!(boxModel.material instanceof GLSLShader)) return;

      const texture =
        background.isWebGLRenderTargetCube ? background.texture : background;
      boxModel.material.uniforms['tCube'].value = texture;
      boxModel.material.uniforms['tFlip'].value =
        background.isWebGLRenderTargetCube ? 1 : -1;

      if (currentBackground !== background ||
        currentBackgroundVersion !== texture.version) {
        boxModel.material.needsUpdate = true;

        currentBackground = background;
        currentBackgroundVersion = texture.version;
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(boxModel, boxModel.mesh, boxModel.material, 0, null);
    } else if (background && background.isTexture) {
      if (planeModel === undefined) {
        planeModel =
          Model.plane(2, 2);

        planeModel.mesh.removeAttribute('normal');

        // enable code injection for non-built-in material
        Object.defineProperty(planeModel.material, 'map', {
          get: function() {
            return this.uniforms.t2D.value;
          }
        });

        objects.update(planeModel);
      }

      if (!(planeModel.material instanceof GLSLShader)) return;

      planeModel.material.uniforms['t2D'].value = background;

      if (background.matrixAutoUpdate === true) {
        background.updateMatrix();
      }

      planeModel.material.uniforms['uvTransform'].value = background.matrix.clone();

      if (currentBackground !== background ||
        currentBackgroundVersion !== background.version) {
        planeModel.material.needsUpdate = true;

        currentBackground = background;
        currentBackgroundVersion = background.version;
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(
        planeModel, planeModel.mesh, planeModel.material, 0, null);
    }
  }

  setClear(color: Color, alpha: number) {
    this.state.colorBuffer.setClear(
      color.r, color.g, color.b, alpha, this.premultipliedAlpha);
  }

  getClearColor() {
    return this.clearColor;
  }
  setClearColor(color: Color, alpha: number) {
    this.clearColor = color.clone();
    this.clearAlpha = alpha !== undefined ? alpha : 1;
    this.setClear(this.clearColor, this.clearAlpha);
  }
  getClearAlpha() {
    return this.clearAlpha;
  }
  setClearAlpha(alpha: number) {
    this.clearAlpha = alpha;
    this.setClear(this.clearColor, this.clearAlpha);
  }
}
