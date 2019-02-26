/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {XStore} from '../../basis/Components';
import Matrix4 from '../../basis/Matrix4';
import Transform from '../../basis/Transform';
import {MaterialExports} from '../materials/MaterialUtils';
import {MeshExports} from '../meshes/MeshUtils';

import ConceptualizatedWebGL from './webgl/ConceptualizatedWebGL';
import WebGLClears from './webgl/WebGLClears';

export type meshAndShader = {
  matrix: Matrix4, mesh: MeshExports; material: MaterialExports;
};

const MeshRenderer =
    (canvas: HTMLCanvasElement, backgroundSetter: (clears: WebGLClears) => void,
     lookingTransform?: Transform) => {
      const ctx = canvas.getContext('webgl2');
      if (ctx === null) {
        throw new Error('The browser is not supported webgl 2.0.');
      }
      const gl = ConceptualizatedWebGL(ctx);
      backgroundSetter(gl.clear);

      const meshAndShaders = new WeakMap<Transform, meshAndShader>();

      return (store: XStore, transform: Transform) => {
        if (store.has('camera')) {
          const camera = store.get('camera');
          transform.traverse(camera.updateProjectionMatrix);
        }
        const transforms: Transform[] = [];
        (lookingTransform || transform).traverse((t) => {
          if (t.store.has('mesh') && t.store.has('material')) {
            transforms.push(t);
            const cache = meshAndShaders.get(t);
            if (cache !== undefined && cache.matrix === t.matrix) return;
            meshAndShaders.set(t, {
              matrix: t.matrix,
              mesh: t.store.get('mesh'),
              material: t.store.get('material')
            });
          }
        });
        const drawCalls = transforms.map(e => {
          const meshShader = meshAndShaders.get(e);
          if (!meshShader)
            return () => {
              console.warn('The transform is empty.', e);
            };
          return gl.drawCallFactory.makeDrawCall(meshShader);
        });

        gl.clear.clear();
        drawCalls.forEach(e => e());
        return store;
      }
    }

export default MeshRenderer;
