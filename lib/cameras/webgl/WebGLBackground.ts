import Color from '../../basis/Color';
import Renderer from '../Renderer';
import WebGLState from './WebGLState';
import Mesh from '../../objects/Mesh';

/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLBackground {
  clearColor = new Color(0x000000);
  clearAlpha = 0;

  planeMesh: Mesh = null;
  boxMesh: Mesh = null;

  // Store the current background texture and its `version`
  // so we can recompile the material accordingly.
  currentBackground = null;
  currentBackgroundVersion = 0;

  constructor(
      private renderer: Renderer, private state: WebGLState,
      private objects: WebGLObjects, private premultipliedAlpha: boolean) {}

  render(renderList, scene, camera, forceClear) {
    const background = scene.background;
    let {
      clearColor,
      clearAlpha,
      planeMesh,
      boxMesh,
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
      if (boxMesh === null) {
        boxMesh = Mesh.cube();

        boxMesh.geometry.removeAttribute('normal');
        boxMesh.geometry.removeAttribute('uv');

        boxMesh.onBeforeRender = function(renderer, scene, camera) {
          this.matrixWorld.copyPosition(camera.matrixWorld);
        };

        // enable code injection for non-built-in material
        Object.defineProperty(boxMesh.material, 'map', {
          get: function() {
            return this.uniforms.tCube.value;
          }
        });

        objects.update(boxMesh);
      }

      var texture =
          background.isWebGLRenderTargetCube ? background.texture : background;
      boxMesh.material.uniforms.tCube.value = texture;
      boxMesh.material.uniforms.tFlip.value =
          background.isWebGLRenderTargetCube ? 1 : -1;

      if (currentBackground !== background ||
          currentBackgroundVersion !== texture.version) {
        boxMesh.material.needsUpdate = true;

        currentBackground = background;
        currentBackgroundVersion = texture.version;
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(boxMesh, boxMesh.geometry, boxMesh.material, 0, null);
    } else if (background && background.isTexture) {
      if (planeMesh === undefined) {
        planeMesh =
            new Mesh(new PlaneBufferGeometry(2, 2), new ShaderMaterial({
                       type: 'BackgroundMaterial',
                       uniforms: ShaderLib.background.uniforms.clone(),
                       vertexShader: ShaderLib.background.vertexShader,
                       fragmentShader: ShaderLib.background.fragmentShader,
                       side: FrontSide,
                       depthTest: false,
                       depthWrite: false,
                       fog: false
                     }));

        planeMesh.geometry.removeAttribute('normal');

        // enable code injection for non-built-in material
        Object.defineProperty(planeMesh.material, 'map', {
          get: function() {
            return this.uniforms.t2D.value;
          }
        });

        objects.update(planeMesh);
      }

      planeMesh.material.uniforms.t2D.value = background;

      if (background.matrixAutoUpdate === true) {
        background.updateMatrix();
      }

      planeMesh.material.uniforms.uvTransform.value.copy(background.matrix);

      if (currentBackground !== background ||
          currentBackgroundVersion !== background.version) {
        planeMesh.material.needsUpdate = true;

        currentBackground = background;
        currentBackgroundVersion = background.version;
      }

      // push to the pre-sorted opaque render list
      renderList.unshift(
          planeMesh, planeMesh.geometry, planeMesh.material, 0, null);
    }
  }

  setClear(color, alpha) {
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
  setClearAlpha(alpha) {
    this.clearAlpha = alpha;
    this.setClear(this.clearColor, this.clearAlpha);
  }
}
