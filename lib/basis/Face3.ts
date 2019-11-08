import Color from './Color';
import Vector3 from './Vector3';

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */


export default class Face3 {
  public vertexNormals: Vector3[] = [];
  public vertexColors: Vector3[] = [];
  constructor(
      public a: number, public b: number, public c: number,
      public normal = new Vector3(), public color = new Color(0),
      public materialIndex = 0) {}

  clone() {
    return new Face3(
        this.a, this.b, this.c, this.normal.clone(), this.color.clone(),
        this.materialIndex);
  }
}
