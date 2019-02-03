/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import EventSource from '../basis/EventSource';
import { BlendMode, FaceSide, BlendFactor, BlendFunc, DepthFunc } from '../cameras/DrawTypes';

export default class Material extends EventSource {
  name = '';

  fog = true;
  lights = true;

  blending: BlendMode = 'Normal';
  side: FaceSide = 'Front';
  flatShading = false;
  vertexColors: 'None' | 'Vertex' | 'Face' = 'None';

  opacity = 1;
  transparent = false;

  blendSrc = BlendFactor.SrcAlphaFactor;
  blendDst = BlendFactor.OneMinusSrcAlphaFactor;
  blendEquation = BlendFunc.AddEquation;
  blendSrcAlpha: BlendFactor = null;
  blendDstAlpha: BlendFactor = null;
  blendEquationAlpha: BlendFunc = null;

  depthFunc: DepthFunc = 'LessEqual';
  depthTest = true;
  depthWrite = true;

  clippingPlanes = null;
  clipIntersection = false;
  clipShadows = false;

  shadowSide = null;

  colorWrite = true;

  precision = null; // override the renderer's default precision for this material

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  dithering = false;

  alphaTest = 0;
  premultipliedAlpha = false;

  visible = true;

  userData = {};

  needsUpdate = true;
};
