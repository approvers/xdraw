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
  frequentUpdate = true;
  order = 2000;

  constructor(
      private canvas: HTMLCanvasElement, width: number, height: number,
      backgroundSetter: (clears: WebGLClears) => void = () => {},
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
    backgroundSetter(this.gl.clear);
  }

  update = [(_store: XStore, transform: Transform) => {
    const looking = this.lookingTransform || transform;
    const drawCalls: (() => void)[] = [];
    looking.traverse(
        (t) => drawCalls.push(this.gl.drawCallFactory.makeDrawCall(
            {mesh: t.store.get('mesh'), material: t.store.get('material')})));

    this.gl.clear.clear();
    drawCalls.forEach(e => e());
  }];
}
