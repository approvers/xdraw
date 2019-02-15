"use strict";
/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const BufferMesh_1 = require("./BufferMesh");
const Lines_1 = require("../materials/Lines");
const Vector3_1 = require("../basis/Vector3");
const BufferAttribute_1 = require("../basis/BufferAttribute");
const Matrix4_1 = require("../basis/Matrix4");
const Ray_1 = require("../basis/Ray");
const Sphere_1 = require("../basis/Sphere");
class Path {
    constructor(mesh = new BufferMesh_1.default(), material = new Lines_1.default({}), lineSegments = 1) {
        this.mesh = mesh;
        this.material = material;
        this.lineSegments = lineSegments;
        this.start = new Vector3_1.default();
        this.end = new Vector3_1.default();
        this.inverseMatrix = new Matrix4_1.default();
        this.ray = new Ray_1.default();
        this.sphere = new Sphere_1.default();
    }
    computeLineDistances() {
        if (this.mesh instanceof BufferMesh_1.default) {
            const positionAttribute = this.mesh.attributes.position;
            const lineDistances = [0];
            for (let i = 1, l = positionAttribute.count; i < l; i++) {
                this.start = Vector3_1.default.fromBufferAttribute(positionAttribute, i - 1);
                this.end = Vector3_1.default.fromBufferAttribute(positionAttribute, i);
                lineDistances[i] = lineDistances[i - 1];
                lineDistances[i] += this.start.distanceTo(this.end);
            }
            this.mesh.addAttribute('lineDistance', BufferAttribute_1.default.fromArray(Float32Array, lineDistances, 1));
        }
        else {
            const vertices = this.mesh.vertices;
            const lineDistances = this.mesh.lineDistances;
            lineDistances[0] = 0;
            for (let i = 1, l = vertices.length; i < l; i++) {
                lineDistances[i] = lineDistances[i - 1];
                lineDistances[i] += vertices[i - 1].distanceTo(vertices[i]);
            }
        }
        return this;
    }
    raycast(raycaster, intersects) {
        const precision = raycaster.linePrecision;
        const mesh = this.mesh;
        const matrixWorld = this.transform.matrixWorld;
        // Checking boundingSphere distance to ray
        if (mesh.boundingSphere === null)
            mesh.computeBoundingSphere();
        this.sphere = mesh.boundingSphere.clone();
        this.sphere.applyMatrix4(matrixWorld);
        this.sphere.radius += precision;
        if (raycaster.ray.intersectsWithSphere(this.sphere) === false)
            return;
        //
        this.inverseMatrix.inverse(matrixWorld);
        this.ray = raycaster.ray.clone().applyMatrix4(this.inverseMatrix);
        const localPrecision = precision / ((this.transform.scale.x + this.transform.scale.y + this.transform.scale.z) / 3);
        const localPrecisionSq = localPrecision * localPrecision;
        let vStart = new Vector3_1.default();
        let vEnd = new Vector3_1.default();
        let interSegment = new Vector3_1.default();
        let interRay = new Vector3_1.default();
        const step = (0 < this.lineSegments) ? 2 : 1;
        if (mesh instanceof BufferMesh_1.default) {
            const index = mesh.index;
            const attributes = mesh.attributes;
            const positions = attributes.position;
            if (index !== null) {
                const indices = index.array;
                for (let i = 0, l = indices.length - 1; i < l; i += step) {
                    const a = indices[i];
                    const b = indices[i + 1];
                    vStart = Vector3_1.default.fromBufferAttribute(positions, a * 3);
                    vEnd = Vector3_1.default.fromBufferAttribute(positions, b * 3);
                    const distSq = this.ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
                    if (distSq > localPrecisionSq)
                        continue;
                    interRay.applyMatrix4(this.transform.matrixWorld); //Move back to world space for distance calculation
                    const distance = raycaster.ray.origin.distanceTo(interRay);
                    if (distance < raycaster.near || distance > raycaster.far)
                        continue;
                    intersects.push({
                        distance: distance,
                        // What do we want? intersection point on the ray or on the segment??
                        // point: raycaster.ray.at( distance ),
                        point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
                        index: i,
                        faceIndex: -1,
                        object: this.transform
                    });
                }
            }
            else {
                for (let i = 0, l = positions.length / 3 - 1; i < l; i += step) {
                    vStart = Vector3_1.default.fromBufferAttribute(positions, 3 * i);
                    vEnd = Vector3_1.default.fromBufferAttribute(positions, 3 * i + 3);
                    const distSq = this.ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);
                    if (distSq > localPrecisionSq)
                        continue;
                    interRay.applyMatrix4(this.transform.matrixWorld); //Move back to world space for distance calculation
                    const distance = raycaster.ray.origin.distanceTo(interRay);
                    if (distance < raycaster.near || distance > raycaster.far)
                        continue;
                    intersects.push({
                        distance: distance,
                        // What do we want? intersection point on the ray or on the segment??
                        // point: raycaster.ray.at( distance ),
                        point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
                        index: i,
                        faceIndex: -1,
                        object: this.transform
                    });
                }
            }
        }
        else {
            const vertices = mesh.vertices;
            const nbVertices = vertices.length;
            for (let i = 0; i < nbVertices - 1; i += step) {
                const distSq = this.ray.distanceSqToSegment(vertices[i], vertices[i + 1], interRay, interSegment);
                if (distSq > localPrecisionSq)
                    continue;
                interRay.applyMatrix4(this.transform.matrixWorld); //Move back to world space for distance calculation
                const distance = raycaster.ray.origin.distanceTo(interRay);
                if (distance < raycaster.near || distance > raycaster.far)
                    continue;
                intersects.push({
                    distance: distance,
                    // What do we want? intersection point on the ray or on the segment??
                    // point: raycaster.ray.at( distance ),
                    point: interSegment.clone().applyMatrix4(this.transform.matrixWorld),
                    index: i,
                    faceIndex: -1,
                    object: this.transform
                });
            }
        }
    }
    clone() {
        return new Path(this.mesh.clone(), this.material);
    }
}
exports.default = Path;
