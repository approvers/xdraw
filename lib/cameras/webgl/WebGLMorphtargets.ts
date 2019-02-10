/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import { XObject } from "../../basis/Transform";
import Mesh from "../../objects/Mesh";
import Material from "../../materials/Material";
import { WebGLProgramService } from "./WebGLPrograms";

function absNumericalSort(a: number[], b: number[]) {

  return Math.abs(b[1]) - Math.abs(a[1]);

}

export default class WebGLMorphtargets {

  constructor(private gl: WebGLRenderingContext) { }

  private influencesList: { [key: string]: number[][] };
  private morphInfluences = new Float32Array(8);

  update(object: XObject, mesh: Mesh, material: Material, program: WebGLProgramService) {

    const objectInfluences = object.morphTargetInfluences;

    const length = objectInfluences.length;

    let influences = this.influencesList[mesh.name];

    if (influences === undefined) {

      // initialise list

      influences = [];

      for (let i = 0; i < length; i++) {

        influences[i] = [i, 0];

      }

      this.influencesList[mesh.name] = influences;

    }

    const morphTargets = material.morphTargets && mesh.morphAttributes.position;
    const morphNormals = material.morphNormals && mesh.morphAttributes.normal;

    // Remove current morphAttributes

    for (let i = 0; i < length; i++) {

      const influence = influences[i];

      if (influence[1] !== 0) {

        if (morphTargets) mesh.removeAttribute('morphTarget' + i);
        if (morphNormals) mesh.removeAttribute('morphNormal' + i);

      }

    }

    // Collect influences

    for (let i = 0; i < length; i++) {

      const influence = influences[i];

      influence[0] = i;
      influence[1] = objectInfluences[i];

    }

    influences.sort(absNumericalSort);

    // Add morphAttributes

    for (let i = 0; i < 8; i++) {

      const influence = influences[i];

      if (influence) {

        const index = influence[0];
        const value = influence[1];

        if (value) {

          if (morphTargets) mesh.addAttribute('morphTarget' + i, morphTargets[index]);
          if (morphNormals) mesh.addAttribute('morphNormal' + i, morphNormals[index]);

          this.morphInfluences[i] = value;
          continue;

        }

      }

      this.morphInfluences[i] = 0;

    }

    program.uniforms.update('morphTargetInfluences', this.morphInfluences);

  }

}
