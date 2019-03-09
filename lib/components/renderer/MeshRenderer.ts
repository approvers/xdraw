/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {XComponent, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';

import ConceptualizatedWebGL from './webgl/ConceptualizatedWebGL';
import WebGLClears from './webgl/WebGLClears';
import WebGLDrawCallFactory from './webgl/WebGLDrawCallFactory';

export default class MeshRenderer implements XComponent {
  ctx: WebGL2RenderingContext;
  gl: {clear: WebGLClears, drawCallFactory: WebGLDrawCallFactory};
  binds = {};
  order = 2000;

  constructor(
      private canvas: HTMLCanvasElement, width: number, height: number,
      private backgroundSetter: (clears: WebGLClears) => void = () => {},
      private lookingTransform?: Transform) {
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ratio = window.devicePixelRatio;
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = this.canvas.getContext('webgl2');
    if (ctx === null) {
      throw new Error('The browser is not supported webgl 2.0.');
    }
    this.ctx = ctx;
    this.gl = ConceptualizatedWebGL(ctx);
    this.backgroundSetter(this.gl.clear);
  }

  update = [(store: XStore, transform: Transform) => {
    if (store.has('camera')) {
      const camera = store.get('camera');
      transform.traverse(camera.updateProjectionMatrix);
    }
    const looking = this.lookingTransform || transform;
    const drawCalls: (() => void)[] = [];
    looking.traverse(
        (t) => drawCalls.push(this.gl.drawCallFactory.makeDrawCall(
            {mesh: t.store.get('mesh'), material: t.store.get('material')})));

    this.gl.clear.clear();
    drawCalls.forEach(e => e());
  }];
}
