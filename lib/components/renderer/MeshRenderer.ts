/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {XComponent, XStore} from '../../basis/Components';
import Matrix4 from '../../basis/Matrix4';
import Transform from '../../basis/Transform';
import {MaterialExports} from '../materials/MaterialUtils';
import {MeshExports} from '../meshes/MeshUtils';

import ConceptualizatedWebGL from './webgl/ConceptualizatedWebGL';
import WebGLClears from './webgl/WebGLClears';
import WebGLDrawCallFactory from './webgl/WebGLDrawCallFactory';

export type meshAndShader = {
  matrix: Matrix4, mesh: MeshExports; material: MaterialExports;
};

export default class MeshRenderer implements XComponent {
  ctx: WebGL2RenderingContext;
  gl: {clear: WebGLClears, drawCallFactory: WebGLDrawCallFactory};
  binds = {};

  constructor(
      private canvas: HTMLCanvasElement,
      private backgroundSetter: (clears: WebGLClears) => void = () => {},
      private lookingTransform?: Transform) {
    const ctx = this.canvas.getContext('webgl2');
    if (ctx === null) {
      throw new Error('The browser is not supported webgl 2.0.');
    }
    this.ctx = ctx;
    this.gl = ConceptualizatedWebGL(ctx);
    this.backgroundSetter(this.gl.clear);
  }

  update(store: XStore, transform: Transform) {
    if (store.has('camera')) {
      const camera = store.get('camera');
      transform.traverse(camera.updateProjectionMatrix);
    }
    const drawCalls: (() => void)[] = [];
    (this.lookingTransform || transform).traverse((t) => {
      if (t.store.has('mesh') && t.store.has('material')) {
        drawCalls.push(this.gl.drawCallFactory.makeDrawCall({
          matrix: t.matrix,
          mesh: t.store.get('mesh'),
          material: t.store.get('material')
        }));
      }
    });

    this.gl.clear.clear();
    drawCalls.forEach(e => e());
  }
}
