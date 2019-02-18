/**
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from '../../basis/BufferAttribute';
import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import {ShaderSet} from '../materials/Material';

import ConceptualizatedWebGL from './webgl/ConceptualizatedWebGL';
import WebGLClears from './webgl/WebGLClears';

const MeshRenderer =
    (canvas: HTMLCanvasElement, backgroundSetter: (clears: WebGLClears) => void,
     lookingTransform?: Transform) => {
      const ctx = canvas.getContext('webgl2');
      if (ctx === null) {
        throw new Error('The browser is not supported webgl 2.0.');
      }
      const gl = ConceptualizatedWebGL(ctx);
      backgroundSetter(gl.clear);

      return (store: XStore, transform: Transform) => {
        const meshAndShaders: {
          transform: Transform; mesh: any; shaders: any[];
          drawType: 'line' | 'triangle';
        }[] = [];
        (lookingTransform || transform).traverse((t) => {
          if (t.store.has('mesh') || t.store.has('shaders')) {
            meshAndShaders.push({
              transform: t,
              mesh: t.store.get('mesh'),
              shaders: t.store.get('shaders'),
              drawType: t.store.get('drawing.mode') || 'triangle'
            });
          }
        });
        const drawCalls = meshAndShaders.map(e => {
          return gl.drawCallFactory.makeDrawCall(gl, e);
        });

        console.log(drawCalls);
        gl.clear.clear();
        return store;
      }
    }

export default MeshRenderer;
