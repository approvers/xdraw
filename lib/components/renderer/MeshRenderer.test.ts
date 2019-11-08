/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from '../../basis/Color';
import Transform from '../../basis/Component';

import MeshRenderer from './MeshRenderer';

test('only background', () => {
  const obj = new Transform;
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  obj.comps.add(MeshRenderer(canvas, (clears) => {
    clears.color = Color.rgb(127, 127, 127);
  }));
  obj.update();
  const data = canvas.toDataURL();
  const link = document.createElement('a');
  link.href = data;
  link.click();
});
