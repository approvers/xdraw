/**
  * @author RkEclair / https://github.com/RkEclair
  */

export default class WebGLUniforms {
  private uniformList: { [name: string]: Function; };

  constructor(private gl: WebGLRenderingContext, private program: WebGLProgram) { }

  clone() {
    const newU = new WebGLUniforms(this.gl, this.program);
    newU.uniformList = this.uniformList;

    return newU;
  }

  addUniform(name: string, size: 1 | 2 | 3 | 4, type: 'float' | 'int' | 'matrix', isArray = false) {
    const location = this.gl.getUniformLocation(this.program, name);
    if (location === null) {
      throw new Error('The uniform has not found: ' + name);
    }
    const vPostfix = isArray ? 'v' : '';
    let func = (..._args: any[]) => { };
    switch (size) {
      case 1:
        switch (type) {
          case 'float':
            func = (x) => this.gl['uniform1f' + vPostfix](location, x);
            break;
          case 'int':
            func = (x) => this.gl['uniform1i' + vPostfix](location, x);
            break;
          case 'matrix':
            throw new Error('Invalid type specifiation.');
        }
        break;
      case 2:
        switch (type) {
          case 'float':
            func = (x, y) => this.gl['uniform2f' + vPostfix](location, x, y);
            break;
          case 'int':
            func = (x, y) => this.gl['uniform2i' + vPostfix](location, x, y);
            break;
          case 'matrix':
            func = (v) => this.gl['uniformMatrix2fv'](location, false, v);
            break;
        }
        break;
      case 3:
        switch (type) {
          case 'float':
            func = (x, y, z) => this.gl['uniform3f' + vPostfix](location, x, y, z);
            break;
          case 'int':
            func = (x, y, z) => this.gl['uniform3i' + vPostfix](location, x, y, z);
            break;
          case 'matrix':
            func = (v) => this.gl['uniformMatrix3fv'](location, false, v);
            break;
        }
        break;
      case 4:
        switch (type) {
          case 'float':
            func = (x, y, z, w) => this.gl['uniform4f' + vPostfix](location, x, y, z, w);
            break;
          case 'int':
            func = (x, y, z, w) => this.gl['uniform4i' + vPostfix](location, x, y, z, w);
            break;
          case 'matrix':
            func = (v) => this.gl['uniformMatrix4fv'](location, false, v);
            break;
        }
        break;
    }
    this.uniformList[name] = func;
  }

  update(name: string, ...args: any[]) {
    this.uniformList[name](...args);
  }

  mergeUniforms(...uniforms: WebGLUniforms[]) {
    for (const tmp of uniforms) {
      const source = tmp.clone().uniformList;
      for (const p in source) {
        this.uniformList[p] = source[p];
      }
    }
  }
}
