"use strict";
/**
 * @author simonThiele / https://github.com/simonThiele
 * @author TristanVALCKE / https://github.com/Itee
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
const Vector3_1 = require("../basis/Vector3");
const Matrix4_1 = require("../basis/Matrix4");
const Transform_1 = require("./Transform");
test("clone", () => {
    const t = new Transform_1.default;
    t.matrixWorldInverse = new Matrix4_1.default([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    t.projectionMatrix = new Matrix4_1.default([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]);
    const cloned = t.clone();
    expect(cloned.matrixWorldInverse).toEqual(t.matrixWorldInverse);
    expect(cloned.projectionMatrix).toEqual(t.projectionMatrix);
});
test("lookAt", () => {
    const t = new Transform_1.default;
    t.lookAt(new Vector3_1.default(0, 1, -1));
    expect(t.rotation.x * (180 / Math.PI)).toBe(45);
});
