/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import EventSource from '../basis/EventSource';
import Transform from '../basis/Transform';
import Material from '../materials/Material';

export default class Scene extends EventSource {
  transform: Transform;
  name = '';
  overrideMaterial?: Material;

  dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}
