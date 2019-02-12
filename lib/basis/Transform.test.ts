/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 * @author RkEclair / https://github.com/RkEclair
 */

import Vector3 from '../basis/Vector3';
import Matrix4 from '../basis/Matrix4';
import PointLight from '../objects/lights/PointLight';
import Color from '../basis/Color';

test("clone", () => {
  const light = new PointLight(new Color(0xffffff), 1);
  const t = light.transform;

  t.matrixWorldInverse = new Matrix4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
  t.projectionMatrix = new Matrix4([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);

  const cloned = light.clone().transform;

	expect(cloned.matrixWorldInverse).toEqual(t.matrixWorldInverse);
	expect(cloned.projectionMatrix).toEqual(t.projectionMatrix);
});

test("lookAt", () => {
  const light = new PointLight(new Color(0xffffff), 1);
  const t = light.transform;
  t.lookAt(new Vector3(0, 1, - 1));

  expect(t.rotation.x * (180 / Math.PI)).toBe(45);
});
