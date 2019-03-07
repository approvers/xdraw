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
import BoxMesh from '../lib/components/meshes/BoxMesh';
import Lines from '../lib/components/materials/Lines';
import Diffuse from '../lib/components/materials/Diffuse';

export default class Index extends Component {
  box = null;
  canvas = null;

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
  }

  componentDidMount() {
    this.canvas.width = 600;
    this.canvas.height = 600;

    const scene = Transform.newScene();

    this.box = new Transform();
    this.box.addComponent(new BoxMesh());
    this.box.addComponent(new Diffuse());
    scene.add(this.box);

    const light = new Transform();
    light.translate(new Vector3(-0.6, -0.6, 0.6));
    light.addComponent(new DirectionalLight());
    scene.add(light);

    scene.addComponent(
      new MeshRenderer(this.canvas, (clears) => {
        clears.color = new Color(0x1a1d1a);
      })
    );

    scene.update();
  }

  frameId = 0;

  updateFrame = () => {
    //this.box.rotate(Euler.fromDegressRotations(1, 0, 1));
    this.box.root.update();
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
        <button
          onClick={(e) => {
            this.updateFrame();
            cancelAnimationFrame(this.frameId);
          }}
        >
          {'Step play'}
        </button>
        <style jsx>{`
          canvas {
            width: 300;
            height: 300;
          }
        `}</style>
      </div>
    );
  }
}
