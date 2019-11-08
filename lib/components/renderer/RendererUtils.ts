/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import BufferAttribute from '../../basis/BufferAttribute';
import {XStore} from '../../basis/Components';

export function extractMesh(store: XStore): {
  index: BufferAttribute; position: BufferAttribute; normal: BufferAttribute;
  uv: BufferAttribute;
} {
  return store.get('mesh');
}
