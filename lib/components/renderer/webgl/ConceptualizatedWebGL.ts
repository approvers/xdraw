/**
 * @author RkEclair / https://github.com/RkEclair
 */

import WebGLBufferFactory from './WebGLBufferFactory';
import WebGLClears from './WebGLClears';
import WebGLDrawCallFactory from './WebGLDrawCallFactory';
import WebGLShaderFactory from './WebGLShaderFactory';

const ConceptualizatedWebGL =
    (ctx: WebGL2RenderingContext) => {
      return {
        clear: new WebGLClears(ctx),
        shaderFactory: new WebGLShaderFactory(ctx),
        bufferFactory: new WebGLBufferFactory(ctx),
        drawCallFactory: new WebGLDrawCallFactory(ctx)
      };
    }

export default ConceptualizatedWebGL;
