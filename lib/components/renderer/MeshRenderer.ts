/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';
import {MaterialExports} from '../materials/MaterialUtils';
import {MeshExports} from '../meshes/MeshUtils';

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
        if (store.has('camera')) {
          const camera = store.get('camera');
          transform.traverse(camera.updateProjectionMatrix);
        }
        const meshAndShaders: {
          transform: Transform; mesh: MeshExports; material: MaterialExports;
        }[] = [];
        (lookingTransform || transform).traverse((t) => {
          if (t.store.has('mesh') || t.store.has('shaders')) {
            meshAndShaders.push({
              transform: t,
              mesh: t.store.get('mesh'),
              material: t.store.get('material')
            });
          }
        });
        const drawCalls =
            meshAndShaders.map(e => gl.drawCallFactory.makeDrawCall(e));


        ctx.viewport(0, 0, canvas.width, canvas.height);
        gl.clear.clear();
        drawCalls.forEach(e => e());
        return store;
      }
    }

export default MeshRenderer;
