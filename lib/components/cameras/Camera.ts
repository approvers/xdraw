/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Component, rangeClamper, selectClamper} from '../../basis/Components';
import Matrix4 from '../../basis/Matrix4';
import Transform from '../../basis/Transform';

type CameraProps = {
  mode: string; fov: number; zoom: number; near: number; far: number;
  focus: number;
  aspect: number;
  filmGauge: number;
  filmOffset: number;
}

const CameraClampers = {
  mode: selectClamper(['Perspective', 'Orthographic']),
  fov: rangeClamper(0, 180),
  aspect: rangeClamper(0, 1),
};

export default class Camera implements Component<CameraProps> {
  defaultProps: CameraProps = {
    mode: 'Perspective',
    fov: 45,
    zoom: 1,
    near: 0.01,
    far: 2000,
    focus: 10,
    aspect: 1,
    filmGauge: 35,
    filmOffset: 0,
  };

  /*
  filmWidth() {
    // film not completely covered in portrait format (aspect < 1)
    return this.binds.filmGauge.get() * Math.min(this.binds.aspect.get(), 1);
  }
  filmHeight() {
    // film not completely covered in landscape format (aspect > 1)
    return this.binds.filmGauge.get() / Math.max(this.binds.aspect.get(), 1);
  }
  */

  run(transform: Transform, props: CameraProps) {
    if (props.mode === 'Orthographic') {
      transform.root.traverse((t) => {
        if (t.id === transform.id) return;
        t.matrixWorldProjection =
            transform.matrixWorld.inverse().multiply(t.matrixWorld);
      });
      return;
    };

    const fudge =
        Matrix4.perspective(props.fov, props.aspect, props.near, props.far)
            .multiply(transform.matrix.inverse());
    transform.root.traverse((t) => {
      if (t.id === transform.id) return;
      t.matrixWorldProjection = fudge.multiply(t.matrixWorld);
    });
  }
}