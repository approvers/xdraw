/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import {Component} from 'react';
import Color from '../lib/basis/Color';
import Transform from '../lib/basis/Transform';
import MeshRenderer from '../lib/components/renderer/MeshRenderer'
import {BackgroundBox} from '../lib/components/Model';

export default class Index extends Component {
	scene = null;
	canvas = null;

	componentDidMount() {
		this.canvas.width = 500;
		this.canvas.height = 500;
		console.log("Ready to render.");
		this.scene = new Transform;
		const bg = BackgroundBox();
		this.scene.add(bg);
	  this.scene.comps.add(MeshRenderer(this.canvas, (clears) => {
			clears.color = new Color(0x444444);
		}));
		this.updateFrame();
		console.log("Rendered");
	}

	updateFrame = () => {
		this.scene.update();
		console.log(this.scene);
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
