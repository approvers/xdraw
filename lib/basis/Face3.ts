import Color from './Color';
import Vector3 from './Vector3';

/**
 * @author RkEclair / https://github.com/RkEclair
 */


export default class Face3 {
  public vertexNormals: Vector3[] = [];
  public vertexColors: Vector3[] = [];
  constructor(
      public a: Vector3, public b: Vector3, public c: Vector3,
      public normal = new Vector3(), public color = new Color(0),
      public materialIndex = 0) {}
}