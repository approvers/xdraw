"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author mikael emtinger / http://gomo.se/
 * @author jonobr1 / http://jonobr1.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Color_1 = require("../basis/Color");
const EventSource_1 = require("../basis/EventSource");
const Matrix4_1 = require("../basis/Matrix4");
const Vector3_1 = require("../basis/Vector3");
const Unlit_1 = require("../materials/Unlit");
const Background_1 = require("../materials/shaders/Background");
const Cube_1 = require("../materials/shaders/Cube");
const PlaneMesh_1 = require("../meshes/PlaneMesh");
const BoxMesh_1 = require("../meshes/BoxMesh");
const BufferMesh_1 = require("../meshes/BufferMesh");
class Model extends EventSource_1.default {
    constructor(mesh = new BufferMesh_1.default(), materials = [new Unlit_1.default({})]) {
        super();
        this.mesh = mesh;
        this.materials = materials;
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};
        const firstMat = materials[0];
        this.material = firstMat;
        if (firstMat instanceof Unlit_1.default)
            firstMat.props.specularColor = new Color_1.default(Math.random() * 0xffffff);
        this.updateMorphTargets();
    }
    static plane(width = 1, height = 1) {
        return new Model(new PlaneMesh_1.default(width, height), [new Unlit_1.default({
                name: 'BackgroundMaterial',
                shader: Background_1.default,
                side: 'Front',
                depthTest: false,
                depthWrite: false,
                fog: false
            })]);
    }
    static cube(width = 1, height = 1, depth = 1) {
        return new Model(new BoxMesh_1.default(width, height, depth), [new Unlit_1.default({
                name: 'BackgroundCubeMaterial',
                shader: Cube_1.default,
                side: 'Back',
                depthTest: true,
                depthWrite: false,
                fog: false
            })]);
    }
    clone() {
        const newM = new Model();
        newM.drawMode = this.drawMode;
        newM.morphTargetInfluences = this.morphTargetInfluences.slice();
        newM.morphTargetDictionary = Object.assign({}, this.morphTargetDictionary);
        return newM;
    }
    computeBoundingSphere() {
        return this.transform.computeBoundingSphere(this.mesh.vertices);
    }
    extractMesh() {
        return (this.mesh !== null && this.mesh instanceof BufferMesh_1.default) ? this.mesh.clone() : new BufferMesh_1.default();
    }
    updateMorphTargets() {
        const mesh = this.mesh;
        if (mesh instanceof BufferMesh_1.default) {
            const morphAttributes = mesh.morphAttributes;
            const keys = Object.keys(morphAttributes);
            if (keys.length > 0) {
                const morphAttribute = morphAttributes[keys[0]];
                if (morphAttribute !== undefined) {
                    this.morphTargetInfluences = [];
                    this.morphTargetDictionary = {};
                    for (let m = 0; m < morphAttribute.length; m++) {
                        const name = morphAttribute[m].name || String(m);
                        this.morphTargetInfluences.push(0);
                        this.morphTargetDictionary[name] = m;
                    }
                }
            }
        }
    }
    raycast(raycaster, intersects) {
        const inverseMatrix = new Matrix4_1.default();
        const intersectionPoint = new Vector3_1.default();
        const mesh = this.mesh;
        const material = this.material;
        const matrixWorld = this.transform.matrixWorld;
        if (material === undefined)
            return;
        // Checking boundingSphere distance to ray
        if (mesh.boundingSphere === null)
            mesh.computeBoundingSphere();
        const sphere = mesh.boundingSphere.clone();
        sphere.applyMatrix4(matrixWorld);
        if (!raycaster.ray.intersectsWithSphere(sphere))
            return;
        //
        inverseMatrix.inverse(matrixWorld);
        const ray = raycaster.ray.clone();
        ray.applyMatrix4(inverseMatrix);
        // Check boundingBox before continuing
        if (mesh.boundingBox !== null) {
            if (!ray.intersectsWithBox(mesh.boundingBox))
                return;
        }
        if (mesh instanceof BufferMesh_1.default) {
            const index = mesh.index;
            const position = mesh.attributes.position;
            const uv = mesh.attributes.uv;
            const groups = mesh.groups;
            const drawRange = mesh.drawRange;
            if (index !== null) {
                // indexed buffer mesh
                if (Array.isArray(material)) {
                    for (const group of groups) {
                        const groupMaterial = material[group.materialIndex];
                        const start = Math.max(group.start, drawRange.start);
                        const end = Math.min(group.start + group.count, drawRange.start + drawRange.count);
                        for (let i = start; i < end; i += 3) {
                            const a = index.getX(i);
                            const b = index.getX(i + 1);
                            const c = index.getX(i + 2);
                            const intersection = raycaster.checkBufferMeshIntersection(this.transform, groupMaterial, position, uv, a, b, c, intersectionPoint);
                            if (intersection) {
                                intersection.faceIndex = Math.floor(i / 3); // triangle number in indexed buffer semantics
                                intersects.push(intersection);
                            }
                        }
                    }
                }
                else {
                    const start = Math.max(0, drawRange.start);
                    const end = Math.min(index.count, drawRange.start + drawRange.count);
                    for (let i = start; i < end; i += 3) {
                        const a = index.getX(i);
                        const b = index.getX(i + 1);
                        const c = index.getX(i + 2);
                        const intersection = raycaster.checkBufferMeshIntersection(this.transform, material, position, uv, a, b, c, intersectionPoint);
                        if (intersection) {
                            intersection.faceIndex = Math.floor(i / 3); // triangle number in indexed buffer semantics
                            intersects.push(intersection);
                        }
                    }
                }
            }
            else if (position !== null) {
                // non-indexed buffer mesh
                if (Array.isArray(material)) {
                    for (const group of groups) {
                        const groupMaterial = material[group.materialIndex];
                        const start = Math.max(group.start, drawRange.start);
                        const end = Math.min(group.start + group.count, drawRange.start + drawRange.count);
                        for (let i = start; i < end; i += 3) {
                            const a = i;
                            const b = i + 1;
                            const c = i + 2;
                            const intersection = raycaster.checkBufferMeshIntersection(this.transform, groupMaterial, position, uv, a, b, c, intersectionPoint);
                            if (intersection) {
                                intersection.faceIndex =
                                    Math.floor(i / 3); // triangle number in non-indexed
                                // buffer semantics
                                intersects.push(intersection);
                            }
                        }
                    }
                }
                else {
                    const start = Math.max(0, drawRange.start);
                    const end = Math.min(position.count, drawRange.start + drawRange.count);
                    for (let i = start; i < end; i += 3) {
                        const a = i;
                        const b = i + 1;
                        const c = i + 2;
                        const intersection = raycaster.checkBufferMeshIntersection(this.transform, material, position, uv, a, b, c, intersectionPoint);
                        if (intersection) {
                            intersection.faceIndex = Math.floor(i / 3); // triangle number in non-indexed buffer semantics
                            intersects.push(intersection);
                        }
                    }
                }
            }
        }
    }
}
exports.default = Model;
