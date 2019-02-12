/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import Color from '../../basis/Color';
import Renderer from '../Renderer';
import WebGLState from './WebGLState';
import WebGLObjects from './WebGLObjects';
import Model from '../../objects/Model';
import Camera from '../Camera';
import { WebGLRenderList } from './WebGLRenderLists';
import Scene from '../../objects/Scene';
import BufferMesh from '../../meshes/BufferMesh';
import Texture from '../../textures/Texture';
import WebGLRenderTarget from './WebGLRenderTarget';

export default class WebGLBackground {
  clearColor = new Color(0x000000);
  clearAlpha = 0;

  planeModel: Model | null = null;
  boxModel: Model | null = null;

  // Store the current background texture and its `version`
  // so we can recompile the material accordingly.
  currentBackground: Color | Texture | WebGLRenderTarget | null;
  currentBackgroundVersion = 0;

  constructor(
    private renderer: Renderer, private state: WebGLState,
    private objects: WebGLObjects, private premultipliedAlpha: boolean) { }

  render(renderList: WebGLRenderList, scene: Scene, camera: Camera, frame: number, forceClear?: boolean) {
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
    } else if (background && background instanceof Color) {
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
      (background instanceof CubeTexture || background instanceof WebGLRenderTargetCube)) {
      if (boxModel === null) {
        boxModel = Model.cube();

        if (boxModel === null || !(boxModel.mesh instanceof BufferMesh))
          throw new Error('Model.cube() generated unexcepted mesh.');

        boxModel.mesh.removeAttribute('normal');
        boxModel.mesh.removeAttribute('uv');

        boxModel.addEventListener('beforeRender', (_renderer: any, _scene: any, camera: Camera) => {
          (boxModel as Model).transform.matrixWorld = camera.matrixWorld.clone();
        });

        // enable code injection for non-built-in material
        Object.defineProperty(boxModel.material, 'map', {
          get: function() {
            return this.shader.uniforms.tCube.value;
          }
        });

        objects.update(boxModel, frame);
      }

      const texture =
        background instanceof WebGLRenderTargetCube ? background.texture : background;
      boxModel.material.props.shader.uniforms['tCube'].value = texture;
      boxModel.material.props.shader.uniforms['tFlip'].value =
        background instanceof WebGLRenderTargetCube ? 1 : -1;

      if (currentBackground !== background ||
        currentBackgroundVersion !== texture.version) {
        boxModel.material.props.needsUpdate = true;

        currentBackground = background;
        currentBackgroundVersion = texture.version;
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(boxModel.transform, boxModel.mesh, boxModel.material, 0);
    } else if (background && background instanceof Texture) {
      if (planeModel === undefined) {
        planeModel =
          Model.plane(2, 2);

        if (planeModel === null || !(planeModel.mesh instanceof BufferMesh))
          throw new Error('Model.plane() generated unexcepted mesh.');

        planeModel.mesh.removeAttribute('normal');

        // enable code injection for non-built-in material
        Object.defineProperty(planeModel.material, 'map', {
          get: function() {
            return this.shader.uniforms.t2D.value;
          }
        });

        objects.update(planeModel, frame);
      }

      if (planeModel === null) return;

      planeModel.material.props.shader.uniforms['t2D'].value = background;

      if (background.matrixAutoUpdate === true) {
        background.updateMatrix();
      }

      planeModel.material.props.shader.uniforms['uvTransform'].value = background.matrix.clone();

      if (currentBackground !== background ||
        currentBackgroundVersion !== background.version) {
        planeModel.material.props.needsUpdate = true;

        currentBackground = background;
        currentBackgroundVersion = background.version;
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(
        planeModel.transform, planeModel.mesh, planeModel.material, 0);
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
