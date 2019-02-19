import Color from '../../basis/Color';
import {XStore} from '../../basis/Components';
import RectAreaLight from '../lights/RectAreaLight';

import MaterialBase from './MaterialUtils';

/**
 * @author RkEclair / https://github.com/RkEclair
 */

export enum LineStyle {
  rect,
  round,
  bevel
}

const LineRenderers: {
  [name: string]: (
      gl: WebGL2RenderingContext, drawCall: (mode: number) => void) => void;
} = {
  Strip: (gl, drawCall) => {
    drawCall(gl.LINE_STRIP);
  },
  Segments: (gl, drawCall) => {
    drawCall(gl.LINES);
  },
  Loop: (gl, drawCall) => {
    drawCall(gl.LINE_LOOP);
  }
};

const LinesGenerator =
    (renderer: (gl: WebGL2RenderingContext, drawCall: (mode: number) => void) =>
         void) =>
        (color = new Color(Math.random() * 0xffffff), lineWidth = 1,
         lineCap = LineStyle.rect, lineJoin = LineStyle.rect) =>
            MaterialBase(
                (store: XStore) => {
                  if (!store.hasBind('material.color')) {
                    store.addBind('material.color', color);
                    store.addBind('material.lineWidth', lineWidth);
                    store.addBind('material.lineCap', lineCap);
                    store.addBind('material.lineJoin', lineJoin);
                  }
                  return store;
                },
                {
                  color: new Float32Array([color.r, color.g, color.b]),
                  lineWidth: new Int32Array([lineWidth]),
                  lineCap: new Int32Array([lineCap]),
                  lineJoin: new Int32Array([lineJoin])
                },
                renderer);

const Lines =
    Object.keys(LineRenderers)
        .reduce(
            (prev, key) => {
              prev[key] = LinesGenerator(LineRenderers[key]);
              return prev;
            },
            new Map<
                string,
                (color: Color, lineWidth?: number, lineCap?: LineStyle,
                 lineJoin?: LineStyle) => (store: XStore) => void>())


export default Lines;
