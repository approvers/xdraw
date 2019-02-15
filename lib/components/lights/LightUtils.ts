/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import { XStore } from "../../basis/Components";
import Vector2 from "../../basis/Vector2";
import Matrix4 from "../../basis/Matrix4";
import Color from "../../basis/Color";

export function packLight(store: XStore, params: {[key: string]: any} = {}) {
  store.set('lightShadow', {
    color: new Color,
    intensity: 1.0,
    ...params
  });
}

export function packLightShadow(store: XStore, params: {[key: string]: any} = {}) {
  store.set('lightShadow', {
    bias: 0,
    radius: 1,
    mapSize: new Vector2(512, 512),
    matrix: new Matrix4(),
    ...params
  });
}
