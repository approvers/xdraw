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
import SphereMesh from '../lib/components/meshes/SphereMesh';
import Unlit from '../lib/components/materials/Unlit';
import PlaneMesh from '../lib/components/meshes/PlaneMesh';

export default class Index extends Component {
  box = null;
  canvas = null;

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
  }

  componentDidMount() {
    const scene = Transform.newScene();

    this.box = new Transform();
    this.box.addComponent(new SphereMesh(0.5));
    this.box.addComponent(new Diffuse());
    scene.add(this.box);

    const light = new Transform();
    light.translate(new Vector3(-2, 2, -2));
    light.addComponent(new DirectionalLight(0.5));
    scene.add(light);

    const light2 = new Transform();
    light2.translate(new Vector3(0, 0, -4));
    light2.addComponent(new DirectionalLight(0.2));
    scene.add(light2);

    scene.addComponent(
      new MeshRenderer(this.canvas, 600, 600, (clears) => {
        clears.color = new Color(0x1a1d1a);
        clears.depth = 0;
      })
    );
    scene.flush();
  }

  frameId = 0;

  updateFrame = () => {
    this.box.rotate(Euler.fromDegressRotations(1, 0, 1));
    this.box.root.flush();
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
            if (!this.state.paused) cancelAnimationFrame(this.frameId);
            this.updateFrame();
            cancelAnimationFrame(this.frameId);
            this.setState({paused: true});
          }}
        >
          {'Step play'}
        </button>
        <style jsx>{`
          canvas {
            width: 600;
            height: 600;
          }
        `}</style>
      </div>
    );
  }
}
