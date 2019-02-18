/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import {Component} from 'react';
import Color from '../xdraw/basis/Color';
import Transform from '../xdraw/basis/Transform';
import MeshRenderer from '../xdraw/components/renderer/MeshRenderer'

export default class Index extends Component {
	scene = null;
	canvas = null;

	componentDidMount() {
		this.canvas.width = 500;
		this.canvas.height = 500;
		console.log("Ready to render.");
		this.scene = new Transform;
	  this.scene.comps.addComponent(MeshRenderer(this.canvas, (clears) => {
			clears.color = new Color(0x666666);
		}));
		this.scene.update();
		console.log("Rendered");
	}

	render() {
		return <div>
			<canvas ref={e => this.canvas = e}></canvas>
			<style jsx>{`
				canvas { width: 100; height: 100; }
			`}</style>
		</div>;
	}
}
