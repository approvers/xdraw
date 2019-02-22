/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import {Component} from 'react';
import Color from '../lib/basis/Color';
import Transform from '../lib/basis/Transform';
import MeshRenderer from '../lib/components/renderer/MeshRenderer'
import {BackgroundBox} from '../lib/components/Model';
import Euler from '../lib/basis/Euler';
import Quaternion from '../lib/basis/Quaternion';
import Vector3 from '../lib/basis/Vector3';

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
	
		this.scene = new Transform;
		this.box = BackgroundBox();
		this.scene.add(this.box);
	  this.scene.comps.add(MeshRenderer(this.canvas, (clears) => {
			clears.color = new Color(0x1a1d1a);
		}));
		this.updateFrame();
	}

	frameId = 0;

	updateFrame = () => {
		this.box.rotate(new Euler(0, 0, 10));
		this.scene.update();
		this.frameId = requestAnimationFrame(this.updateFrame);
	};

	render() {
		return <div>
			<canvas ref={e => this.canvas = e}></canvas>
			<style jsx>{`
				canvas { width: 100; height: 100; }
			`}</style>
		</div>;
	}
}
