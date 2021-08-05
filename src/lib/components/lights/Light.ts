/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Component} from '../../basis/Component';
import Vector3 from '../../basis/Vector3';
import Transform from '../Transform';


export default abstract class Light extends Component {
  readonly transform = new Transform;

  translate(amount: Vector3) {
    this.transform.translate(amount);
  }

  get position(): Vector3 {
    return this.transform.position;
  }

  get direction(): Vector3 {
    return Transform.front.fromQuaternion(this.transform.quaternion);
  }

  abstract intensity(illuminated: Transform): number;
}