/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Scene} from '../Scene';

import Renderer from './Renderer';
import ConceptualizatedWebGL from './webgl/ConceptualizatedWebGL';
import WebGLClears from './webgl/WebGLClears';
import WebGLDrawCallFactory from './webgl/WebGLDrawCallFactory';

export default class MeshRenderer extends Renderer {
  ctx: WebGL2RenderingContext;
  gl: {clear: WebGLClears, drawCallFactory: WebGLDrawCallFactory};
  binds = {};
  order = 2000;

  constructor(
      scene: Scene, private canvas: HTMLCanvasElement, width: number,
      height: number,
      backgroundSetter: (clears: WebGLClears) => void = () => {}) {
    super(scene);

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

  animHandle?: number;
  start() {
    this.animHandle = requestAnimationFrame(this.animate);
  }

  private drawCalls: (() => void)[] = [];
  run() {
    for (const looking of this.scene.objs) {
      looking.traverse(
          (t) => this.drawCalls.push(this.gl.drawCallFactory.makeDrawCall(
              {mesh: t.store.get('mesh'), material: t.store.get('material')})));
    }
  }

  animate = () => {
    this.gl.clear.clear();
    this.drawCalls.forEach(e => e());
    requestAnimationFrame(this.animate);
  };

  unmount() {
    if (this.animHandle) cancelAnimationFrame(this.animHandle);
  }
}
