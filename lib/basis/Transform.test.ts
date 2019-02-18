/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 * @author RkEclair / https://github.com/RkEclair
 */

import Matrix4 from '../basis/Matrix4';
import Vector3 from '../basis/Vector3';

import Transform from './Transform';

test('clone', () => {
  const t = new Transform;

  t.matrixWorldInverse =
      new Matrix4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  t.projectionMatrix =
      new Matrix4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  const cloned = t.clone();

  expect(cloned.matrixWorldInverse).toEqual(t.matrixWorldInverse);
  expect(cloned.projectionMatrix).toEqual(t.projectionMatrix);
});

test('lookAt', () => {
  const t = new Transform;
  t.lookAt(new Vector3(0, 1, -1));

  expect(t.rotation.x * (180 / Math.PI)).toBe(45);
});
