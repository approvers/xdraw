/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

import {Component} from 'react';
import Color from '../lib/basis/Color';
import MeshRenderer from '../lib/components/renderer/MeshRenderer';
import {SimpleBox, ModelBuilder} from '../lib/components/Model';
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
import {Scene} from '../lib/components/Scene';

export default class Index extends Component {
  box = null;
  canvas = null;
  renderer = null;

  componentWillUnmount() {
    cancelAnimationFrame(this.frameId);
  }

  componentDidMount() {
    const scene = new Scene();

    this.box = new ModelBuilder()
      .mesh(new BoxMesh())
      .material(new Diffuse())
      .build();
    this.box.translate(new Vector3(0.5, 0, 0));
    scene.add(this.box);

    const light = new DirectionalLight(0.5);
    light.translate(new Vector3(0, 2, 2));
    scene.add(light);

    const ground = new ModelBuilder()
      .mesh(new PlaneMesh())
      .material(new Diffuse(light, new Color(0xaaaaaa)))
      .build();
    ground.scale(new Vector3(10, 10, 1));
    ground.rotate(Euler.fromDegressRotations(-90, 0, 0));
    ground.translate(new Vector3(0, -1.5, 0));
    scene.add(ground);

    const camera = new Camera('Perspective', 40);
    camera.translate(new Vector3(0, 0, 1.3));
    scene.add(camera);

    const renderer = new MeshRenderer(
      scene,
      this.canvas,
      600,
      600,
      (clears) => {
        clears.color = new Color(0x0a0d0a);
        clears.depth = 0;
      }
    );
    renderer.flush();
    this.renderer = renderer;
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
