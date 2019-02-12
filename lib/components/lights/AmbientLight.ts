/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Transform from "../../basis/Transform";
import Color from "../../basis/Color";
import Matrix4 from "../../basis/Matrix4";
import { XStore, rangeClamper } from "../../basis/Components";
import Texture from "../../basis/textures/Texture";
import WebGLLights, { LightUniformsCache } from "../cameras/webgl/WebGLLights";

const AmbientLight = (color = new Color(0xffffff), intensity = 1.0) => (store: XStore, _transform: Transform) => {
  if (!store.hasBind('ambientlight.color')) {
    store.addBind('ambientlight.color', color)
    .addBind('ambientlight.intensity', intensity, rangeClamper(0, 1))
    .addBind('ambientlight.shadow', false)
    .addBind('ambientlight.shadow.bias', 0, rangeClamper(0, 1))
    .addBind('ambientlight.shadow.radius', 1)
    .addBind('ambientlight.shadow.map', new Texture);
  }
  const self = store.getBindValues('ambientlight.');
  store.set('lights', {
    shine(state: WebGLLights, _cache: LightUniformsCache, _viewMatrix: Matrix4) {
  		const ambient = state.ambient;
  		ambient[0] += self.color.r * self.intensity;
  		ambient[1] += self.color.g * self.intensity;
  		ambient[2] += self.color.b * self.intensity;
  	}
  });
  return store;
}

export default AmbientLight;
