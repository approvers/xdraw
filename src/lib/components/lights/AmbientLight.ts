/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import Color from "../../basis/Color";
import { XStore, rangeClamper } from "../../basis/Components";
import Matrix4 from "../../basis/Matrix4";
import Texture from "../../basis/textures/Texture";
import Transform from "../../basis/Component";

const AmbientLight =
  (color = new Color(0xffffff), intensity = 1.0) =>
  (store: XStore, _transform: Transform) => {
    if (!store.hasBind("ambientlight.color")) {
      store
        .addBind("ambientlight.color", color)
        .addBind("ambientlight.intensity", intensity, rangeClamper(0, 1))
        .addBind("ambientlight.shadow", false)
        .addBind("ambientlight.shadow.bias", 0, rangeClamper(0, 1))
        .addBind("ambientlight.shadow.radius", 1)
        .addBind("ambientlight.shadow.map", new Texture());
    }
    const self = store.getBindValues("ambientlight.");
    store.set("lights", {});
    return store;
  };

export default AmbientLight;
