/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Component} from '../../basis/Component';
import Vector3 from '../../basis/Vector3';
import Transform from '../Transform';


export default class Light extends Component {
  private transform = new Transform;

  translate(amount: Vector3) {
    this.transform.translate(amount);
  }
}