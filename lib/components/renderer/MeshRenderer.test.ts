/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import Transform from "../../basis/Transform";
import MeshRenderer from "./MeshRenderer";
import Color from "../../basis/Color";

test('only background', () => {
  const obj = new Transform;
  const canvas = document.createElement('canvas');
	canvas.width = 100;
	canvas.height = 100;
  obj.comps.addComponent(MeshRenderer(canvas, (clears) => {
		clears.color = Color.rgb(127, 127, 127);
	}));
	obj.comps.process(obj);
	const data = canvas.toDataURL();
	const link = document.createElement('a');
	link.href = data;
	link.click();
});
