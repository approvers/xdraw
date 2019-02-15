"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector2_1 = require("../basis/Vector2");
const Vector3_1 = require("../basis/Vector3");
const Matrix4_1 = require("../basis/Matrix4");
const Triangle_1 = require("../basis/Triangle");
const Billboard_1 = require("../materials/Billboard");
class Sprite {
    constructor(material = new Billboard_1.default()) {
        this.material = material;
        this.center = new Vector2_1.default(0.5, 0.5);
    }
    raycast(raycaster, intersects) {
        function transformVertex(vertexPosition, mvPosition, center, scale, sin, cos) {
            // compute position in camera space
            const alignedPosition = vertexPosition.clone().sub(center).addScalar(0.5).multiply(scale);
            const rotatedPosition = alignedPosition.clone();
            // to check if rotation is not zero
            if (sin !== undefined && cos !== undefined) {
                rotatedPosition.x = (cos * alignedPosition.x) - (sin * alignedPosition.y);
                rotatedPosition.y = (sin * alignedPosition.x) + (cos * alignedPosition.y);
            }
            vertexPosition = mvPosition.clone();
            vertexPosition.x += rotatedPosition.x;
            vertexPosition.y += rotatedPosition.y;
            // transform to world space
            return vertexPosition.applyMatrix4(viewWorldMatrix);
        }
        const worldScale = Vector3_1.default.fromMatrixScale(this.transform.matrixWorld);
        const viewWorldMatrix = this.transform.matrixWorld.multiply(this.transform.modelViewMatrix.inverse(Matrix4_1.default.identity()));
        const mvPosition = Vector3_1.default.fromMatrixPosition(this.transform.modelViewMatrix);
        const rotation = this.material.props.rotation;
        let sin = 0, cos = 0;
        if (rotation !== 0) {
            cos = Math.cos(rotation);
            sin = Math.sin(rotation);
        }
        const center = new Vector3_1.default(this.center.x, this.center.y);
        const vA = transformVertex(new Vector3_1.default(-0.5, -0.5, 0), mvPosition, center, worldScale, sin, cos);
        let vB = transformVertex(new Vector3_1.default(0.5, -0.5, 0), mvPosition, center, worldScale, sin, cos);
        const vC = transformVertex(new Vector3_1.default(0.5, 0.5, 0), mvPosition, center, worldScale, sin, cos);
        const uvA = new Vector2_1.default(0, 0);
        let uvB = new Vector2_1.default(1, 0);
        const uvC = new Vector2_1.default(1, 1);
        // check first triangle
        let intersectPoint = raycaster.ray.intersectedPointWithTriangle(new Triangle_1.default(vA, vB, vC), false);
        if (intersectPoint === null) {
            // check second triangle
            vB = transformVertex(new Vector3_1.default(-0.5, 0.5, 0), mvPosition, center, worldScale, sin, cos);
            uvB = new Vector2_1.default(0, 1);
            intersectPoint = raycaster.ray.intersectedPointWithTriangle(new Triangle_1.default(vA, vC, vB), false);
            if (intersectPoint === null) {
                return;
            }
        }
        const distance = raycaster.ray.origin.distanceTo(intersectPoint);
        if (distance < raycaster.near || distance > raycaster.far)
            return;
        intersects.push({
            faceIndex: uvB.x == 1 ? 0 : 1,
            distance: distance,
            point: intersectPoint.clone(),
            uv: new Triangle_1.default(vA, vB, vC).uv(intersectPoint, [uvA, uvB, uvC]),
            object: this.transform
        });
    }
    clone() {
        const newS = new Sprite(this.material);
        newS.center = this.center.clone();
        return newS;
    }
}
exports.Sprite = Sprite;
