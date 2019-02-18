import BufferAttribute from '../../../basis/BufferAttribute';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLShaderFactory {
  constructor(private gl: WebGL2RenderingContext) {}

  private extractAttributes(program: WebGLProgram) {
    const attributeCount =
        this.gl.getProgramParameter(program, this.gl.ACTIVE_ATTRIBUTES);
    const attributes:
        {[name: string]: {load: (buffer: BufferAttribute) => void;}} = {};
    for (let i = 0; i < attributeCount; ++i) {
      const attribute = this.gl.getActiveAttrib(program, i);
      if (attribute === null) continue;
      attributes[attribute.name] = {
        load: (buffer: BufferAttribute) => {
          this.gl.vertexAttribPointer(
              i, buffer.length, buffer.isFloat ? this.gl.FLOAT : this.gl.INT,
              false, 0, 0);
        }
      };
    }
    return attributes;
  }

  private extractUniforms(program: WebGLProgram) {
    const uniformCount =
        this.gl.getProgramParameter(program, this.gl.ACTIVE_UNIFORMS);
    const uniforms: {[name: string]: number} = {};
    for (let i = 0; i < uniformCount; ++i) {
      const uniform = this.gl.getActiveUniform(program, i);
      if (uniform === null) continue;
      uniforms[uniform.name] = i;
    }
    return uniforms;
  }

  private compileShader(type: number, source: string) {
    const shader = this.gl.createShader(type);
    if (shader === null) throw new Error('Fail to create shader.');
    this.gl.shaderSource(shader, source);
    this.gl.compileShader(shader);
    const success = this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS);
    if (success) {
      return shader;
    }
    console.error(this.gl.getShaderInfoLog(shader));
    this.gl.deleteShader(shader);
    throw new Error('Fail to compile shader.')
  }

  makeShader(
      vertexShaderProgram: string = `
attribute vec4 a_position;
void main() {
  gl_Position = a_position;
}
`,
      fragmentShaderProgram: string = `
precision mediump float;

void main() {
  gl_FragColor = vec4(1, 0, 0.5, 1);
}
`) {
    const vertexShader =
        this.compileShader(this.gl.VERTEX_SHADER, vertexShaderProgram);
    const fragmentShader =
        this.compileShader(this.gl.FRAGMENT_SHADER, fragmentShaderProgram);
    const program = this.gl.createProgram();
    if (program === null) throw new Error('Fail to create program.');
    this.gl.attachShader(program, vertexShader);
    this.gl.attachShader(program, fragmentShader);
    this.gl.linkProgram(program);
    const success = this.gl.getProgramParameter(program, this.gl.LINK_STATUS);
    if (success) {
      return {
        use: () => {
          this.gl.useProgram(program);
        },
        uniforms: this.extractUniforms(program),
        attributes: this.extractAttributes(program)
      };
    }

    console.error(this.gl.getProgramInfoLog(program));
    this.gl.deleteProgram(program);
    throw new Error('Fail to link shaders.')
  }
}