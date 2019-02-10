/**
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author RkEclair / https://github.com/RkEclair
 */

import EventSource from '../basis/EventSource';
import { BlendMode, FaceSide, BlendFactor, BlendFunc, DepthFunc } from '../cameras/DrawTypes';
import Texture from '../textures/Texture';

export interface MaterialOptions {
  name?: string;

  fog?: boolean;
  lights?: boolean;

  blending?: BlendMode;
  side?: FaceSide;
  flatShading?: boolean;
  vertexColors?: 'None' | 'Vertex' | 'Face';

  opacity?: number;
  transparent?: boolean;

  blendSrc?: BlendFactor;
  blendDst?: BlendFactor;
  blendEquation?: BlendFunc;
  blendSrcAlpha?: BlendFactor;
  blendDstAlpha?: BlendFactor;
  blendEquationAlpha?: BlendFunc;

  depthFunc?: DepthFunc;
  depthTest?: boolean;
  depthWrite?: boolean;

  clippingPlanes?: any[];
  clipIntersection?: boolean;
  clipShadows?: boolean;

  shadowSide?: FaceSide;

  colorWrite?: boolean;

  precision?: string;
  polygonOffset?: boolean;
  polygonOffsetFactor?: number;
  polygonOffsetUnits?: number;

  dithering?: boolean;

  alphaTest?: number;
  premultipliedAlpha?: boolean;

  visible?: boolean;
};

let globalId = 0;

export default class Material extends EventSource {
  id: number;
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
  blendSrcAlpha: BlendFactor;
  blendDstAlpha: BlendFactor;
  blendEquationAlpha: BlendFunc;

  depthFunc: DepthFunc = 'LessEqual';
  depthTest = true;
  depthWrite = true;

  clippingPlanes = null;
  clipIntersection = false;
  clipShadows = false;

  shadowSide = null;

  colorWrite = true;

  precision: 'highp' | 'mediump' | 'lowp'; // override the renderer's default precision for this material
  maps: {[name: string]: Texture[]};

  polygonOffset = false;
  polygonOffsetFactor = 0;
  polygonOffsetUnits = 0;

  dithering = false;

  alphaTest = 0;
  premultipliedAlpha = false;

  visible = true;

  userData = {};

  needsUpdate = true;

  constructor(options: MaterialOptions) {
    super();
    this.id = globalId++;
    (Object as any).assign(this, options);
  }
};
