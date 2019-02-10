import { WebGLProgramService } from "./WebGLPrograms";

/**
 * @author Mugen87 / https://github.com/Mugen87
 * @author RkEclair / https://github.com/RkEclair
 */

export default class WebGLInfo {
  memory = {
    geometries: 0,
    textures: 0
  };

  render = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  programs: {[key: string]: WebGLProgramService};
  autoReset: true;

  constructor(private gl: WebGLRenderingContext) {}

  update(count: number, mode: number, instanceCount: number) {

    instanceCount = instanceCount || 1;

    this.render.calls++;

    switch (mode) {

      case this.gl.TRIANGLES:
        this.render.triangles += instanceCount * (count / 3);
        break;

      case this.gl.TRIANGLE_STRIP:
      case this.gl.TRIANGLE_FAN:
        this.render.triangles += instanceCount * (count - 2);
        break;

      case this.gl.LINES:
        this.render.lines += instanceCount * (count / 2);
        break;

      case this.gl.LINE_STRIP:
        this.render.lines += instanceCount * (count - 1);
        break;

      case this.gl.LINE_LOOP:
        this.render.lines += instanceCount * count;
        break;

      case this.gl.POINTS:
        this.render.points += instanceCount * count;
        break;

      default:
        console.error('WebGLInfo: Unknown draw mode: ', mode);
        break;

    }

  }

  reset() {
    this.render.frame++;
    this.render.calls = 0;
    this.render.triangles = 0;
    this.render.points = 0;
    this.render.lines = 0;
  }
}
