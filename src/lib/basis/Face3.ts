import Color from "./Color";
import Vector3 from "./Vector3";

/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class Face3 {
  public vertexNormals: Vector3[] = [];

  public vertexColors: Vector3[] = [];

  public normal = new Vector3();

  public color = new Color(0);

  public materialIndex = 0;

  constructor(public coefficients: { a: number; b: number; c: number }) {}

  clone(): Face3 {
    const cloned = new Face3({ ...this.coefficients });
    cloned.normal = this.normal.clone();
    cloned.color = this.color.clone();
    cloned.materialIndex = this.materialIndex;
    return cloned;
  }
}
