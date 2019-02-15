"use strict";
/**
 * @author mikael emtinger / http://gomo.se/
 * @author alteredq / http://alteredqualia.com/
 * @author ikerr / http://verold.com
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Matrix4_1 = require("../basis/Matrix4");
const Vector4_1 = require("../basis/Vector4");
class Bone {
}
exports.Bone = Bone;
class Skeleton {
    constructor(bones = [], boneInverses = []) {
        this.bones = bones;
        this.boneInverses = boneInverses;
        // copy the bone array
        this.bones = bones.slice(0);
        this.boneMatrices = new Float32Array(bones.length * 16);
        // use the supplied bone inverses or calculate the inverses
        if (boneInverses === undefined) {
            this.calculateInverses();
        }
        else {
            if (this.bones.length === boneInverses.length) {
                this.boneInverses = boneInverses.slice(0);
            }
            else {
                console.warn('boneInverses has the wrong length.');
                this.boneInverses.fill(new Matrix4_1.default(), 0, this.bones.length);
            }
        }
    }
    calculateInverses() {
        this.bones.forEach(e => {
            this.boneInverses.push(e.transform.matrixWorld.inverse());
        });
    }
    pose() {
        // recover the bind-time world matrices
        this.bones.forEach((e, i) => {
            e.transform.matrixWorld = this.boneInverses[i].inverse();
        });
        // compute the local matrices, positions, rotations and scales
        for (const bone of this.bones) {
            if (bone.transform.parent && bone.transform.parent.object instanceof Bone) {
                bone.transform.matrix = bone.transform.parent.matrixWorld.inverse().multiply(bone.transform.matrixWorld);
            }
            else {
                bone.transform.matrix = bone.transform.matrixWorld.clone();
            }
            const { position, quaternion, scale } = bone.transform.matrix.decompose();
            bone.transform.position = position;
            bone.transform.quaternion = quaternion;
            bone.transform.scale = scale;
        }
    }
    update() {
        const bones = this.bones;
        const boneInverses = this.boneInverses;
        const boneTexture = this.boneTexture;
        // flatten bone matrices to array
        for (let i = 0; i < bones.length; i++) {
            // compute the offset between the current and the original transform
            const matrix = bones[i] ? bones[i].transform.matrixWorld : Matrix4_1.default.identity();
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
    getBoneByName(name) {
        return this.bones.find(e => e.transform.name === name);
    }
}
exports.Skeleton = Skeleton;
class Outfit {
    constructor(mesh, material) {
        this.mesh = mesh;
        this.material = material;
        this.bindMatrix = new Matrix4_1.default();
        this.bindMatrixInverse = new Matrix4_1.default();
        this.bindMode = 'attached';
    }
    bind(skeleton, bindMatrix) {
        this.skeleton = skeleton;
        if (bindMatrix === undefined) {
            this.transform.updateMatrixWorld(true);
            this.skeleton.calculateInverses();
            bindMatrix = this.transform.matrixWorld;
        }
        this.bindMatrix = bindMatrix.clone();
        this.bindMatrixInverse = bindMatrix.inverse();
    }
    pose() {
        this.skeleton.pose();
    }
    normalizeSkinWeights() {
        let vector = new Vector4_1.default();
        const skinWeight = this.mesh.attributes.skinWeight;
        for (let i = 0, l = skinWeight.count; i < l; i++) {
            vector.x = skinWeight.getX(i);
            vector.y = skinWeight.getY(i);
            vector.z = skinWeight.getZ(i);
            vector.w = skinWeight.getW(i);
            const scale = 1.0 / vector.manhattanLength();
            if (scale !== Infinity) {
                vector.multiplyScalar(scale);
            }
            else {
                vector = new Vector4_1.default(1, 0, 0, 0); // do something reasonable
            }
            skinWeight.setXYZW(i, vector.x, vector.y, vector.z, vector.w);
        }
    }
    updateMatrixWorld(force) {
        this.transform.updateMatrixWorld(force);
        if (this.bindMode === 'attached') {
            this.bindMatrixInverse = this.transform.matrixWorld.inverse();
        }
        else {
            this.bindMatrixInverse = this.bindMatrix.inverse();
        }
    }
    clone() {
        const newO = new Outfit(this.mesh, this.material);
        newO.bind(this.skeleton, this.bindMatrix);
        return newO;
    }
}
exports.default = Outfit;
