/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {XStore} from '../../basis/Components';
import Transform from '../../basis/Component';

import Camera from './Camera';

test('set props', () => {
  const newStore = Camera()(new XStore(), new Transform());
  expect(newStore).toEqual(new XStore({
    'camera': {updateProjectionMatrix: () => {}},
    'props.camera': {
      mode: 'Perspective',
      fov: 50,
      zoom: 1,
      near: 0.01,
      far: 2000,
      focus: 10,
      aspect: 1,
      filmGauge: 35,  // in millimeters
      filmOffset: 0
    }
  }));
});
