/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 * @author RkEclair / https://github.com/RkEclair
 */

import { XStore, selectClamper } from '../../basis/Components';
import Transform from '../../basis/Transform';

const Camera = (mode: 'Perspective' | 'Orthographic' = 'Perspective', fov = 50, zoom = 1, near = 0.01, far = 2000, focus = 10, aspect = 1, filmGauge = 35, filmOffset = 0) => (store: XStore, transform: Transform) => {
  if (!store.hasBind('props.camera.mode')) {
    store.addBind('props.camera.mode', mode, selectClamper(['Perspective', 'Orthographic']))
      .addBind('props.camera.fov', fov)
      .addBind('props.camera.zoom', zoom)
      .addBind('props.camera.near', near)
      .addBind('props.camera.far', far)
      .addBind('props.camera.focus', focus)
      .addBind('props.camera.aspect', aspect)
      .addBind('props.camera.filmGauge', filmGauge) // in millimeters
      .addBind('props.camera.filmOffset', filmOffset);
  }
  const self = store.getBindValues('props.camera.');
  store.set('camera', {
    filmWidth() {
      // film not completely covered in portrait format (aspect < 1)
      return self.filmGauge * Math.min(self.aspect, 1);
    },
    filmHeight() {
      // film not completely covered in landscape format (aspect > 1)
      return self.filmGauge / Math.max(self.aspect, 1);
    },
    updateProjectionMatrix(view?: { width: number, height: number, fullWidth: number, fullHeight: number, offsetX: number, offsetY: number }) {
      if (mode !== 'Perspective') return;
      let top = self.near * Math.tan(Math.PI / 180 * 0.5 * self.fov) / zoom,
        height = 2 * top,
        width = self.aspect * height,
        left = - 0.5 * width;

      if (view !== undefined) {

        const fullWidth = view.fullWidth,
          fullHeight = view.fullHeight;

        left += view.offsetX * width / fullWidth;
        top -= view.offsetY * height / fullHeight;
        width *= view.width / fullWidth;
        height *= view.height / fullHeight;

      }

      const skew = filmOffset;
      if (skew !== 0) left += self.near * skew / this.filmWidth();

      transform.projectionMatrix.makePerspective(left, left + width, top, top - height, self.near, self.far);

      transform.projectionMatrixInverse.inverse(transform.projectionMatrix);
    }
  });
  return store;
};

export default Camera;
