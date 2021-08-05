/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */

import { XStore } from "../basis/Components";
import Matrix4 from "../basis/Matrix4";
import { DataTexture } from "../basis/textures/Texture";
import Transform from "../basis/Component";
import Vector4 from "../basis/Vector4";

export class Skeleton {
  boneMatrices: Float32Array;

  boneTexture?: DataTexture;

  constructor(
    public bones: Transform[] = [],
    public boneInverses: Matrix4[] = [],
  ) {
    // Copy the bone array
    this.bones = bones.slice(0);
    this.boneMatrices = new Float32Array(bones.length * 16);

    // Use the supplied bone inverses or calculate the inverses

    if (boneInverses === undefined) {
      this.calculateInverses();
    } else if (this.bones.length === boneInverses.length) {
      this.boneInverses = boneInverses.slice(0);
    } else {
      console.warn("boneInverses has the wrong length.");
      this.boneInverses.fill(new Matrix4(), 0, this.bones.length);
    }
  }

  calculateInverses() {
    this.bones.forEach((e) => {
      this.boneInverses.push(e.matrixWorld.inverse());
    });
  }

  pose() {
    // Recover the bind-time world matrices
    this.bones.forEach((e, i) => {
      e.matrixWorld = this.boneInverses[i].inverse();
    });

    // Compute the local matrices, positions, rotations and scales

    for (const bone of this.bones) {
      if (bone.parent !== null) {
        bone.matrix = bone.parent.matrixWorld
          .inverse()
          .multiply(bone.matrixWorld);
      } else {
        bone.matrix = bone.matrixWorld.clone();
      }

      const { position, quaternion, scale } = bone.matrix.decompose();
      bone.position = position;
      bone.quaternion = quaternion;
      bone.scale = scale;
    }
  }

  update() {
    const { bones } = this;
    const { boneInverses } = this;
    const { boneTexture } = this;

    // Flatten bone matrices to array
    for (let i = 0; i < bones.length; i++) {
      // Compute the offset between the current and the original transform
      const matrix = bones[i] ? bones[i].matrixWorld : Matrix4.identity();

      const offsetMatrix = matrix.multiply(boneInverses[i]);
      this.boneMatrices = new Float32Array(offsetMatrix.toArray(i * 16));
    }

    if (boneTexture !== undefined) {
      boneTexture.texture.needsUpdate = true;
    }
  }

  clone() {
    return new Skeleton(this.bones, this.boneInverses);
  }

  getTransformByName(name: string) {
    return this.bones.find((e) => e.name === name);
  }
}

const Outfit = () => {
  const binded = true;
  return (store: XStore, transform: Transform) => {
    transform.updateMatrixWorld = function (force?: boolean) {
      transform.updateMatrixWorld(force);

      if (binded) {
        this.bindMatrixInverse = transform.matrixWorld.inverse();
      } else {
        this.bindMatrixInverse = this.bindMatrix.inverse();
      }
    };
    store.set("outfit", {
      bind(skeleton: Skeleton, bindMatrix?: Matrix4) {
        this.skeleton = skeleton;
        if (bindMatrix === undefined) {
          this.transform.updateMatrixWorld(true);
          this.skeleton.calculateInverses();
          bindMatrix = transform.matrixWorld;
        }
        this.bindMatrix = bindMatrix.clone();
        this.bindMatrixInverse = bindMatrix.inverse();
      },
      pose() {
        this.skeleton.pose();
      },
      normalizeSkinWeights() {
        let vector = new Vector4();
        const { skinWeight } = store.getBindValues("mesh.");

        for (let i = 0; i < skinWeight.count; i++) {
          vector.x = skinWeight.getX(i);
          vector.y = skinWeight.getY(i);
          vector.z = skinWeight.getZ(i);
          vector.w = skinWeight.getW(i);
          const scale = 1.0 / vector.manhattanLength();
          if (scale !== Infinity) {
            vector.multiplyScalar(scale);
          } else {
            vector = new Vector4(1, 0, 0, 0); // Do something reasonable
          }
          skinWeight.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
      },
    });
    return store;
  };
};

export default Outfit;
