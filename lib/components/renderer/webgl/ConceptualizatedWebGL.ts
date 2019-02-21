/**
 * @author RkEclair / https://github.com/RkEclair
 */

import WebGLClears from './WebGLClears';
import WebGLDrawCallFactory from './WebGLDrawCallFactory';

const ConceptualizatedWebGL =
    (ctx: WebGL2RenderingContext) => {
      return {
        clear: new WebGLClears(ctx),
        drawCallFactory: new WebGLDrawCallFactory(ctx)
      };
    }

export default ConceptualizatedWebGL;
