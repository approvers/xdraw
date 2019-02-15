"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const Components_1 = require("../../basis/Components");
const Camera_1 = require("./Camera");
const Transform_1 = require("../../basis/Transform");
test('set props', () => {
    const newStore = Camera_1.default()(new Components_1.XStore(), new Transform_1.default());
    expect(newStore).toEqual(new Components_1.XStore({
        "camera": { updateProjectionMatrix: () => { } },
        "props.camera": {
            mode: 'Perspective',
            fov: 50,
            zoom: 1,
            near: 0.01,
            far: 2000,
            focus: 10,
            aspect: 1,
            filmGauge: 35,
            filmOffset: 0
        }
    }));
});
