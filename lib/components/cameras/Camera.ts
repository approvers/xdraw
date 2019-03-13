/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 * @author RkEclair / https://github.com/RkEclair
 */

import {rangeClamper, selectClamper, unmapBinds, XBind, XComponent, XStore} from '../../basis/Components';
import Matrix4 from '../../basis/Matrix4';
import Transform from '../../basis/Transform';

export default class Camera implements XComponent {
  order = 1200;
  frequentUpdate = true;
  binds;
  constructor(
      mode: 'Perspective'|'Orthographic' = 'Perspective', fov = 45, zoom = 1,
      near = 0.01, far = 2000, focus = 10, aspect = 1, filmGauge = 35,
      filmOffset = 0) {
    this.binds = {
      mode: new XBind(mode, selectClamper(['Perspective', 'Orthographic'])),
      fov: new XBind(fov, rangeClamper(0, 180)),
      zoom: new XBind(zoom),
      near: new XBind(near),
      far: new XBind(far),
      focus: new XBind(focus),
      aspect: new XBind(aspect, rangeClamper(0, 1)),
      filmGauge: new XBind(filmGauge),
      filmOffset: new XBind(filmOffset)
    };
  }

  filmWidth() {
    // film not completely covered in portrait format (aspect < 1)
    return this.binds.filmGauge.get() * Math.min(this.binds.aspect.get(), 1);
  }
  filmHeight() {
    // film not completely covered in landscape format (aspect > 1)
    return this.binds.filmGauge.get() / Math.max(this.binds.aspect.get(), 1);
  }

  update = [(_store: XStore, transform: Transform) => {
    const self = unmapBinds(this.binds);

    if (self.mode === 'Orthographic') {
      transform.root.traverse((t) => {
        if (t.id === transform.id) return;
        t.matrixWorldProjection =
            transform.matrixWorld.inverse().multiply(t.matrixWorld);
      });
      return;
    };

    const fudge =
        Matrix4.perspective(self.fov, self.aspect, self.near, self.far)
            .multiply(transform.matrix.inverse());
    transform.root.traverse((t) => {
      if (t.id === transform.id) return;
      t.matrixWorldProjection = fudge.multiply(t.matrixWorld);
    });
  }];
}