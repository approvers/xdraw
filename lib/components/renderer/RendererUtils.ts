/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import { XStore } from "../../basis/Components";
import BufferAttribute from "../../basis/BufferAttribute";

export function extractMesh(store: XStore): {
  indices: BufferAttribute;
  position: BufferAttribute;
  normal: BufferAttribute;
  uv: BufferAttribute;
} {
  return store.get('mesh');
}
