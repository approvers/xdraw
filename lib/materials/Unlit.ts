/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Color from '../basis/Color';
import Material, { MaterialProperties } from './Material';

export default class Unlit implements Material {
  props: MaterialProperties;

  constructor(options?: any) {
    const props = new MaterialProperties(options || {
      specularColor: new Color(0xffffff),

      maps: {
        lightMap: { textures: [], intensity: 1.0 },
        aoMap: { textures: [], intensity: 1.0 },
        specularMap: {
          textures: [],
          combine: 'Multiply',
          reflectivity: 1,
          refractionRatio: 0.98,
        },
        alphaMap: {textures: []},
        envMap: {textures: []},
      },

      wireframe: false,
      wireframeLinewidth: 1,
      wireframeLinecap: 'round',
      wireframeLinejoin: 'round',

      skinning: false,
      morphTargets: false,

      lights: false,
    });
    (Object as any).assign(this.props, props);
  }

  clone() {
    const newM = new Unlit(new MaterialProperties({}));
    newM.props.specularColor = this.props.specularColor.clone();

    newM.props.maps = this.props.maps; // TODO: make it deep copy

    newM.props.wireframe = this.props.wireframe;
    newM.props.wireframeLinewidth = this.props.wireframeLinewidth;
    newM.props.wireframeLinecap = this.props.wireframeLinecap;
    newM.props.wireframeLinejoin = this.props.wireframeLinejoin;

    newM.props.skinning = this.props.skinning;
    newM.props.morphTargets = this.props.morphTargets;
  }

  toJSON() {
    throw new Error('Not implemented');
  }
}
