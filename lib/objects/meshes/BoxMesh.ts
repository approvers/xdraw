import BufferAttribute from '../../basis/BufferAttribute';
import Vector3 from '../../basis/Vector3';
import BufferMesh from '../BufferMesh';
import Vector2 from '../../basis/Vector2';

export default class BoxMesh extends BufferMesh {
  indices: number[];

  private numberOfVertices = 0;
  private groupStart = 0;

  constructor(
      public width = 1, public height = 1, public depth = 1,
      widthSegments: number = 1, heightSegments: number = 1,
      depthSegments: number = 1) {
    super();
    widthSegments = Math.floor(widthSegments);
    heightSegments = Math.floor(heightSegments);
    depthSegments = Math.floor(depthSegments);

    // build each side of the box geometry

    this.buildPlane(
        'z', 'y', 'x', -1, -1, depth, height, width, depthSegments,
        heightSegments,
        0);  // px
    this.buildPlane(
        'z', 'y', 'x', 1, -1, depth, height, -width, depthSegments,
        heightSegments,
        1);  // nx
    this.buildPlane(
        'x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments,
        2);  // py
    this.buildPlane(
        'x', 'z', 'y', 1, -1, width, depth, -height, widthSegments,
        depthSegments,
        3);  // ny
    this.buildPlane(
        'x', 'y', 'z', 1, -1, width, height, depth, widthSegments,
        heightSegments,
        4);  // pz
    this.buildPlane(
        'x', 'y', 'z', -1, -1, width, height, -depth, widthSegments,
        heightSegments,
        5);  // nz

    // build geometry

    this.setIndex(this.indices);
    this.addAttribute(
        'position', BufferAttribute.fromArray(Float32Array, this.vertices.reduce((prev, curr) => curr.toArray(prev), []), 3));
    this.addAttribute(
        'normal', BufferAttribute.fromArray(Float32Array, this.normals.reduce((prev, curr) => curr.toArray(prev), []), 3));
    this.addAttribute(
        'uv', BufferAttribute.fromArray(Float32Array, this.uvs.reduce((prev, curr) => curr.toArray(prev), []), 2));

    this.mergeVertices();
  }

  private buildPlane(
      u, v, w, udir, vdir, width, height, depth, gridX, gridY,
      materialIndex: number) {
    const segmentWidth = width / gridX;
    const segmentHeight = height / gridY;

    const widthHalf = width / 2;
    const heightHalf = height / 2;
    const depthHalf = depth / 2;

    const gridX1 = gridX + 1;
    const gridY1 = gridY + 1;

    const vector = new Vector3();

    let vertexCounter = 0;
    let groupCount = 0;
    // generate vertices, normals and uvs

    for (let iy = 0; iy < gridY1; iy++) {
      const y = iy * segmentHeight - heightHalf;

      for (let ix = 0; ix < gridX1; ix++) {
        const x = ix * segmentWidth - widthHalf;

        // set values to correct vector component

        vector[u] = x * udir;
        vector[v] = y * vdir;
        vector[w] = depthHalf;

        // now apply vector to vertex buffer

        this.vertices.push(vector.clone());

        // set values to correct vector component

        vector[u] = 0;
        vector[v] = 0;
        vector[w] = depth > 0 ? 1 : -1;

        // now apply vector to normal buffer

        this.normals.push(vector.clone());

        // uvs

        this.uvs.push(new Vector2(ix / gridX, 1 - iy / gridY));

        // counters

        vertexCounter += 1;
      }
    }

    // indices

    // 1. you need three indices to draw a single face
    // 2. a single segment consists of two faces
    // 3. so we need to generate six (2*3) indices per segment

    for (let iy = 0; iy < gridY; iy++) {
      for (let ix = 0; ix < gridX; ix++) {
        const a = this.numberOfVertices + ix + gridX1 * iy;
        const b = this.numberOfVertices + ix + gridX1 * (iy + 1);
        const c = this.numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
        const d = this.numberOfVertices + (ix + 1) + gridX1 * iy;

        // faces

        this.indices.push(a, b, d);
        this.indices.push(b, c, d);

        // increase counter

        groupCount += 6;
      }
    }

    // add a group to the geometry. this will ensure multi material support

    this.addGroup(this.groupStart, groupCount, materialIndex);

    // calculate new start value for groups

    this.groupStart += groupCount;

    // update total number of vertices

    this.numberOfVertices += vertexCounter;
  }
}
