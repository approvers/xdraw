/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import ConceptualizatedWebGL from './webgl/ConceptualizatedWebGL';
import WebGLClears from './webgl/WebGLClears';

const MeshRenderer =
    (canvas: HTMLCanvasElement,
     backgroundSetter: (clears: WebGLClears) => void) => {
      const ctx = canvas.getContext('webgl');
      if (ctx === null) {
        throw new Error('The browser is not supported webgl.');
      }
      const gl = ConceptualizatedWebGL(ctx);
      backgroundSetter(gl.clear);
      return (store: XStore, transform: Transform) => {
        gl.clear.clear();
        return store;
      }
    }

export default MeshRenderer;
