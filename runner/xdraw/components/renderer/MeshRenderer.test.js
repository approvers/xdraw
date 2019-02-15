"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
const Transform_1 = require("../../basis/Transform");
const MeshRenderer_1 = require("./MeshRenderer");
const Color_1 = require("../../basis/Color");
test('only background', () => {
    const obj = new Transform_1.default;
    const canvas = document.createElement('canvas');
    canvas.width = 100;
    canvas.height = 100;
    obj.comps.addComponent(MeshRenderer_1.default(canvas, (clears) => {
        clears.color = Color_1.default.rgb(127, 127, 127);
    }));
    obj.comps.process(obj);
    const data = canvas.toDataURL();
    const link = document.createElement('a');
    link.href = data;
    link.click();
});
