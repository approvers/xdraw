/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {unmapBinds, XComponent, XStore} from '../../basis/Components';
import Matrix4 from '../../basis/Matrix4';
import Vector2 from '../../basis/Vector2';

export function packLight(component: XComponent) {
  component.update.push(
      (store: XStore) => store.set('light', unmapBinds(component.binds)));
}

export function packLightShadow(
    store: XStore, params: {[key: string]: any} = {}) {
  store.set('lightShadow', {
    bias: 0,
    radius: 1,
    mapSize: new Vector2(512, 512),
    matrix: new Matrix4(),
    ...params
  });
}
