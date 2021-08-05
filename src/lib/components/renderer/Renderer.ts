/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Component} from '../../basis/Component';
import {Scene} from '../Scene';

export default class Renderer extends Component {
  constructor(protected scene: Scene) {
    super({});
  }
}
