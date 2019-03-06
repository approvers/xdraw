/**
 * @author RkEclair / https://github.com/RkEclair
 */

import {Component} from 'react';
import Color from '../lib/basis/Color';
import Transform from '../lib/basis/Transform';
import MeshRenderer from '../lib/components/renderer/MeshRenderer';
import {SimpleBox} from '../lib/components/Model';
import Euler from '../lib/basis/Euler';
import Quaternion from '../lib/basis/Quaternion';
import Vector3 from '../lib/basis/Vector3';
import Camera from '../lib/components/cameras/Camera';
import DirectionalLight from '../lib/components/lights/DirectionalLight';

export default class Index extends Component {
  scene = null;
  box = null;
  canvas = null;

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
  }

  componentDidMount() {
    this.canvas.width = 500;
    this.canvas.height = 500;

    this.scene = new Transform();
    this.box = SimpleBox();
    this.scene.add(this.box);
    this.scene.addComponent(new DirectionalLight());
    this.scene.addComponent(
      new MeshRenderer(this.canvas, (clears) => {
        clears.color = new Color(0x1a1d1a);
      })
    );
    this.box.rotate(Euler.fromDegressRotations(1, 0, 1));
    this.scene.update();
  }

  frameId = 0;

  updateFrame = () => {
    this.box.rotate(Euler.fromDegressRotations(1, 0, 1));
    this.scene.update();
    this.frameId = requestAnimationFrame(this.updateFrame);
  };

  state = {
    paused: true
  };

  render() {
    return (
      <div>
        <canvas ref={(e) => (this.canvas = e)} />
        <button
          onClick={(e) => {
            if (!this.state.paused) cancelAnimationFrame(this.frameId);
            else this.updateFrame();
            this.setState({paused: !this.state.paused});
          }}
        >
          {this.state.paused ? 'Push to play' : 'Push to pause'}
        </button>
        <style jsx>{`
          canvas {
            width: 100;
            height: 100;
          }
        `}</style>
      </div>
    );
  }
}
