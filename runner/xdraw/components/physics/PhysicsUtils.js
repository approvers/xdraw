"use strict";
/**
 * @author RkEclair / https://github.com/RkEclair
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Raycast = (colliders) => (ray) => {
    colliders.map(e => e(ray));
};
