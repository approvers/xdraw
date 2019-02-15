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
		this.canvas.width = 100;
		this.canvas.height = 100;
		console.log("Ready to render.");
		{
			const gl = this.canvas.getContext('webgl');
			gl.clearColor(0, 0, 0, 1);
			gl.clear(gl.COLOR_BUFFER_BIT);
		}
		this.scene = new Transform;
	  this.scene.comps.addComponent(MeshRenderer(this.canvas, (clears) => {
			clears.color = Color.rgb(127, 127, 127);
		}));
		this.scene.update();
		console.log("Rendered");
		this.setState({});
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
