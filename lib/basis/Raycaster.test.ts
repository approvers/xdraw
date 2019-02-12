/**
 * @author simonThiele / https://github.com/simonThiele
 * @author RkEclair / https://github.com/RkEclair
 */

import Raycaster from './Raycaster';
import Vector3 from './Vector3';
import Transform from './Transform';
import SphereMesh from '../components/meshes/SphereMesh';
import Camera from '../components/cameras/Camera';
import { XStore } from './Components';

function checkRayDirectionAgainstReferenceVector(rayDirection: Vector3, refVector: Vector3) {
  expect(refVector.x - rayDirection.x).toBeLessThanOrEqual(Number.EPSILON);
  expect(refVector.y - rayDirection.y).toBeLessThanOrEqual(Number.EPSILON);
  expect(refVector.z - rayDirection.z).toBeLessThanOrEqual(Number.EPSILON);
}

function getRaycaster() {
  return new Raycaster(
    new Vector3(0, 0, 0),
    new Vector3(0, 0, - 1),
    1,
    100
  );
}

function getSphere() {
  const sphere = new Transform();
  sphere.comps.addComponent(SphereMesh(1, 100, 100));
  return sphere;
}

function getObjectsToCheck() {
  const objects: Transform[] = [];

  const sphere1 = getSphere();
  sphere1.position = new Vector3(0, 0, - 10);
  sphere1.name = '1';
  objects.push(sphere1);

  const sphere11 = getSphere();
  sphere11.position = new Vector3(0, 0, 1);
  sphere11.name = '11';
  sphere1.add(sphere11);

  const sphere12 = getSphere();
  sphere12.position = new Vector3(0, 0, - 1);
  sphere12.name = '12';
  sphere1.add(sphere12);

  const sphere2 = getSphere();
  sphere2.position = new Vector3(- 5, 0, - 5);
  sphere2.name = '2';
  objects.push(sphere2);

  objects.forEach(e => e.updateMatrixWorld());

  return objects;
}

test('constructor', () => {
  {
    const origin = new Vector3(0, 0, 0);
    const direction = new Vector3(0, 0, - 1);
    const a = new Raycaster(origin, direction);

    expect(a.ray.origin).toEqual(origin);
    expect(a.ray.direction).toEqual(direction);
  }
  {
    const origin = new Vector3(1, 1, 1);
    const direction = new Vector3(-1, 1, 0);
    const a = new Raycaster(origin, direction);

    expect(a.ray.origin).toEqual(origin);
    expect(a.ray.direction).toEqual(direction);
  }
});

test('setFromCamera (Perspective)', () => {

  const raycaster = new Raycaster();
  const store = Camera('Perspective', 90, 1, 1, 1000)(new XStore, new Transform);

  raycaster.setFromCamera({
    x: 0,
    y: 0
  }, store);
  expect(raycaster.ray.direction).toEqual(Transform.front);

  const step = 0.1;

  for (let x = - 1; x <= 1; x += step) {
    for (let y = - 1; y <= 1; y += step) {
      raycaster.setFromCamera({
        x,
        y
      }, store);

      const refVector = new Vector3(x, y, 1).normalize();
      checkRayDirectionAgainstReferenceVector(raycaster.ray.direction, refVector);
    }
  }
});

test('setFromCamera (Orthographic)', () => {

  const raycaster = new Raycaster();
  const store = Camera('Orthographic', -1, 1, 1, -1, 0, 1000)(new XStore, new Transform);
  const expectedOrigin = new Vector3(0, 0, 0);
  const expectedDirection = Transform.front;

  raycaster.setFromCamera({
    x: 0,
    y: 0
  }, store);

  expect(raycaster.ray.origin).toEqual(expectedOrigin);
  expect(raycaster.ray.direction).toEqual(expectedDirection);
});

test('intersectObject', () => {
  const raycaster = getRaycaster();
  const objectsToCheck = getObjectsToCheck();

  expect(raycaster.intersectObject(objectsToCheck[0]).length).toEqual(1);

  expect(raycaster.intersectObject(objectsToCheck[0], true).length).toEqual(3);

  const intersections = raycaster.intersectObject(objectsToCheck[0], true);
  for (let i = 0; i < intersections.length - 1; i++) {
    expect(intersections[i].distance).toBeLessThanOrEqual(intersections[i + 1].distance);
  }
});

test('intersectObjects', () => {

  const raycaster = getRaycaster();
  const objectsToCheck = getObjectsToCheck();

  expect(raycaster.intersectObjects(objectsToCheck).length).toEqual(1);

  expect(raycaster.intersectObjects(objectsToCheck, true).length).toEqual(3);

  const intersections = raycaster.intersectObjects(objectsToCheck, true);
  for (let i = 0; i < intersections.length - 1; i++) {
    expect(intersections[i].distance).toBeLessThanOrEqual(intersections[i + 1].distance);
  }
});
