/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 * @author RkEclair / https://github.com/RkEclair
 */

import {selectClamper, unmapBinds, XBind, XComponent, XStore} from '../../basis/Components';
import Transform from '../../basis/Transform';

export default class Camera implements XComponent {
  binds;
  constructor(
      mode: 'Perspective'|'Orthographic' = 'Perspective', fov = 45, zoom = 1,
      near = 0.01, far = 2000, focus = 10, aspect = 1, filmGauge = 35,
      filmOffset = 0) {
    this.binds = {
      mode: new XBind(mode, selectClamper(['Perspective', 'Orthographic'])),
      fov: new XBind(fov),
      zoom: new XBind(zoom),
      near: new XBind(near),
      far: new XBind(far),
      focus: new XBind(focus),
      aspect: new XBind(aspect),
      filmGauge: new XBind(filmGauge),
      filmOffset: new XBind(filmOffset),
    };
  }

  update(store: XStore, _transform: Transform) {
    const self = unmapBinds(this.binds);

    store.set('camera', {
      filmWidth() {
        // film not completely covered in portrait format (aspect < 1)
        return self.filmGauge * Math.min(self.aspect, 1);
      },
      filmHeight() {
        // film not completely covered in landscape format (aspect > 1)
        return self.filmGauge / Math.max(self.aspect, 1);
      },
      updateProjectionMatrix(t: Transform, view?: {
        width: number,
        height: number,
        fullWidth: number,
        fullHeight: number,
        offsetX: number,
        offsetY: number
      }) {
        if (self.mode === 'Orthographic') return;
        let top = self.near * Math.tan(Math.PI / 180 * 0.5 * self.fov) /
            self.zoom,
            height = 2 * top, width = self.aspect * height, left = -0.5 * width;

        if (view !== undefined) {
          const fullWidth = view.fullWidth, fullHeight = view.fullHeight;

          left += view.offsetX * width / fullWidth;
          top -= view.offsetY * height / fullHeight;
          width *= view.width / fullWidth;
          height *= view.height / fullHeight;
        }

        const skew = self.filmOffset;
        if (skew !== 0) left += self.near * skew / this.filmWidth();

        t.matrix = t.matrix.makePerspective(
            left, left + width, top, top - height, self.near, self.far);
      }
    });
    return store;
  };
}