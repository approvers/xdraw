/**
 * @author mrdoob / http://mrdoob.com/
 * @author greggman / http://games.greggman.com/
 * @author zz85 / http://www.lab4games.net/zz85/blog
 * @author tschw
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {rangeClamper, selectClamper} from '../../basis/Clampers';
import {Component} from '../../basis/Component';
import Matrix4 from '../../basis/Matrix4';
import Vector3 from '../../basis/Vector3';
import Transform from '../Transform';

export default class Camera extends Component {
  public readonly transform = new Transform;

  constructor(
      mode: 'Perspective'|'Orthographic' = 'Perspective', fov: number = 45) {
    super({
      'Mode': {
        initValue: mode,
        clamper: selectClamper(['Perspective', 'Orthographic'])
      },
      'Field of View': {initValue: fov, clamper: rangeClamper(0, 180)},
      'Aspect Ratio': {initValue: 1, clamper: rangeClamper(0, 1)}
    });
  }

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

  run() {
    const mode =
        this.store.addProp<'Perspective'|'Orthographic'>('Mode', 'Perspective');
    const fov = this.store.addProp('Field of View', 45);
    const zoom = this.store.addProp('Zoom', 1);
    const near = this.store.addProp('Near', 0.01);
    const far = this.store.addProp('Far', 2000);
    const focus = this.store.addProp('Focus', 10);
    const aspect = this.store.addProp('Asoect Ratio', 1);
    const filmGauge = this.store.addProp('Film Gauge', 35);
    const filmOffset = this.store.addProp('Field Offset', 0);

    if (mode === 'Orthographic') {
      this.transform.root.traverse((t) => {
        if (t.id === this.transform.id) return;
        t.applyProjection(this.transform.worldMatrix.inverse());
      });
      return;
    };

    const fudge = Matrix4.perspective(fov, aspect, near, far)
                      .multiply(this.transform.localMatrix.inverse());
    this.transform.root.traverse((t) => {
      if (t.id === this.transform.id) return;
      t.applyProjection(fudge);
    });
  }

  translate(amount: Vector3): void {
    this.transform.translate(amount);
  }
}