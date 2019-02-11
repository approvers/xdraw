/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import Material, { MaterialProperties } from "./Material";

export default class Billboard implements Material {
  props: MaterialProperties;

	rotation = 0;
	sizeAttenuation = true;
}
