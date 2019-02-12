/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import { XStore } from "../../basis/Components";
import Camera from "./Camera";
import Transform from "../../basis/Transform";

test('set props', () => {
  const newStore = Camera()(new XStore(), new Transform());
  expect(newStore).toEqual(new XStore({
    "camera": {updateProjectionMatrix: () => {}},
    "props.camera": {
      mode: 'Perspective',
      fov: 50,
      zoom: 1,
      near: 0.01,
      far: 2000,
      focus: 10,
      aspect: 1,
      filmGauge: 35,	// in millimeters
      filmOffset: 0
    }
	}));
});
