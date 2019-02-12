/**
 * @author RkEclair / https://github.com/RkEclair
 */

import EventSource from '../basis/EventSource';
import Sphere from '../basis/Sphere';
import Vector3 from '../basis/Vector3';
import Color from '../basis/Color';
import Vector2 from '../basis/Vector2';
import Vector4 from '../basis/Vector4';
import Box3 from '../basis/Box3';
import Face3 from '../basis/Face3';

type MorphTarget = {
  name: string; vertices: Vector3[]; normals: Vector3[];
};

type MorphNormal = {
  name?: string; vertexNormals: Vector3[]; faceNormals: Vector3[];
};

export default class Mesh extends EventSource {
  name = '';

  vertices: Vector3[] = [];
  normals: Vector3[] = [];
  uvs: Vector2[] = [];
  colors: Color[] = [];
  faces: Face3[] = [];
  faceVertexUvs: Vector2[][][] = [[]];

  morphTargets: MorphTarget[] = [];
  morphNormals: MorphNormal[] = [];

  skinWeights: Vector4[] = [];
  skinIndices: Vector4[] = [];

  lineDistances: number[] = [];

  boundingBox: Box3;
  boundingSphere = new Sphere();

  groups: { start: number; count: number; materialIndex: number }[] = [];

  // update flags
  elementsNeedUpdate = false;
  verticesNeedUpdate = false;
  uvsNeedUpdate = false;
  normalsNeedUpdate = false;
  colorsNeedUpdate = false;
  lineDistancesNeedUpdate = false;
  groupsNeedUpdate = false;

  clone() {
    const newM = new Mesh();

    // name

    this.name = this.name;

    // vertices
    newM.vertices = this.vertices.map(e => e.clone());

    // colors

    newM.colors = this.colors.map(e => e.clone());

    // faces

    newM.faces = this.faces.map(e => e.clone());

    // face vertex uvs

    for (let faceVertexUV of newM.faceVertexUvs) {
      if (faceVertexUV === undefined || faceVertexUV === null) {
        faceVertexUV = [];
      }

      faceVertexUV = this.faceVertexUvs.reduce((prev, uv) => {
        prev.push(uv.reduce((prev, vec) => {
          prev.push(...vec.map(e => e.clone()));
          return prev;
        }, []));
        return prev;
      }, []);
    }

    // morph targets

    newM.morphTargets = this.morphTargets.reduce((prev, target) => {
      const morphTarget: {
        name: string; vertices: Vector3[]; normals: Vector3[];
      } = {
        name: target.name,
        vertices: [],
        normals: []
      };

      // vertices

      if (Array.isArray(target.vertices)) {

        morphTarget.vertices = target.vertices.map(e => e.clone());

      }

      // normals

      if (Array.isArray(target.normals)) {

        morphTarget.normals = target.normals.map(e => e.clone());

      }

      prev.push(morphTarget);
      return prev;
    }, [] as MorphTarget[]);

    // morph normals

    newM.morphNormals = this.morphNormals.reduce((prev, thisMorphNormal) => {

      const morphNormal: MorphNormal = {vertexNormals: [], faceNormals: []};

      // vertex normals

      if (Array.isArray(thisMorphNormal.vertexNormals)) {

        morphNormal.vertexNormals = thisMorphNormal.vertexNormals.map(e => e.clone());

      }

      // face normals

      if (Array.isArray(thisMorphNormal.faceNormals)) {

        morphNormal.faceNormals = thisMorphNormal.faceNormals.map(e => e.clone());

      }

      prev.push(morphNormal);
      return prev;
    }, [] as MorphNormal[]);

    // skin weights

    newM.skinWeights = this.skinWeights.map(e => e.clone());

    // skin indices

    newM.skinIndices = this.skinIndices.map(e => e.clone());

    // line distances

    newM.lineDistances = this.lineDistances.slice();

    // bounding box

    const boundingBox = this.boundingBox;

    if (boundingBox !== null) {

      newM.boundingBox = boundingBox.clone();

    }

    // bounding sphere

    const boundingSphere = this.boundingSphere;

    if (boundingSphere !== null) {

      newM.boundingSphere = boundingSphere.clone();

    }

    // update flags

    newM.elementsNeedUpdate = this.elementsNeedUpdate;
    newM.verticesNeedUpdate = this.verticesNeedUpdate;
    newM.uvsNeedUpdate = this.uvsNeedUpdate;
    newM.normalsNeedUpdate = this.normalsNeedUpdate;
    newM.colorsNeedUpdate = this.colorsNeedUpdate;
    newM.lineDistancesNeedUpdate = this.lineDistancesNeedUpdate;
    newM.groupsNeedUpdate = this.groupsNeedUpdate;

    return newM;
  }

  computeBoundingSphere() {
    this.boundingSphere = Sphere.fromPoints(this.vertices);
  }

  computeGroups(mesh: Mesh) {
    const groups: { start: number; count: number; materialIndex: number }[] = [];
    let i = 0, group: { start: number; count: number; materialIndex: number } = {
      start: 0, count: 0, materialIndex: 0
    }, materialIndex = -1;

    const faces = mesh.faces;

    for (; i < faces.length; i++) {
      const face = faces[i];

      // materials
      if (face.materialIndex !== materialIndex) {
        materialIndex = face.materialIndex;

        group.count = (i * 3) - group.start;
        groups.push(group);

        group.start = i * 3;
        group.materialIndex = materialIndex;
      }
    }

    if (group !== undefined) {
      group.count = (i * 3) - group.start;
      groups.push(group);
    }

    this.groups = groups;
  }

  mergeVertices() {
    const verticesMap = {};  // Hashmap for looking up vertices by position
    // coordinates (and making sure they are unique)
    const unique: Vector3[] = [], changes: number[] = [];

    const precisionPoints =
      4;  // number of decimal points, e.g. 4 for epsilon of 0.0001
    const precision = Math.pow(10, precisionPoints);

    for (let i = 0; i < this.vertices.length; i++) {
      const v = this.vertices[i];
      const key = Math.round(v.x * precision) + '_' +
        Math.round(v.y * precision) + '_' + Math.round(v.z * precision);

      if (verticesMap[key] === undefined) {
        verticesMap[key] = i;
        unique.push(this.vertices[i]);
        changes[i] = unique.length - 1;

      } else {
        // console.log('Duplicate vertex found. ', i, ' could be using ',
        // verticesMap[key]);
        changes[i] = changes[verticesMap[key]];
      }
    }


    // if faces are completely degenerate after merging vertices, we
    // have to remove them from the geometry.
    const faceIndicesToRemove: number[] = [];

    for (let i = 0; i < this.faces.length; ++i) {
      const face = this.faces[i];
      face.a = changes[face.a];
      face.b = changes[face.b];
      face.c = changes[face.c];
      const indices = [face.a, face.b, face.c];

      // if any duplicate vertices are found in a Face3
      // we have to remove the face as nothing can be saved
      for (let n = 0; n < 3; n++) {
        if (indices[n] === indices[(n + 1) % 3]) {
          faceIndicesToRemove.push(i);
          break;
        }
      }
    }

    for (const idx of faceIndicesToRemove) {
      this.faces.splice(idx, 1);
      this.faceVertexUvs.forEach(e => e.splice(idx, 1));
    }

    // Use unique set of vertices

    const diff = this.vertices.length - unique.length;
    this.vertices = unique;
    return diff;
  }
}
