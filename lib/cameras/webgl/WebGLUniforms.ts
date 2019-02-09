/**
  * @author RkEclair / https://github.com/RkEclair
  */

export default class Uniforms {
  private uniformList: {[name: string]: WebGLUniformLocation};

  constructor(private gl: WebGLRenderingContext, private program: WebGLProgram) { }

  clone(): Uniforms {
    const newU = new Uniforms(this.gl, this.program);
    newU.uniformList = this.uniformList;

    return newU;
  }

  addUniform(name: string) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (location === null) {
      throw new Error('The uniform has not found: ' + name);
    }
    this.uniformList[name] = location;
  }

  mergeUniforms(...uniforms: Uniforms[]) {
    for (const tmp of uniforms) {
      const source = tmp.clone().uniformList;
      for (const p in source) {
        this.uniformList[p] = source[p];
      }
    }
  }
}
