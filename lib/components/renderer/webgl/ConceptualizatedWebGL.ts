/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import WebGLClears from "./WebGLClears";

const ConceptualizatedWebGL = (ctx: WebGLRenderingContext) => {
  return {
    clear: new WebGLClears(ctx)
  };
}

export default ConceptualizatedWebGL;
