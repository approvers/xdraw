/**
 * @author simonThiele / https://github.com/simonThiele
 * @author RkEclair / https://github.com/RkEclair
 */

import BufferAttribute from './BufferAttribute';
import Color from './Color';
import Vector2 from './Vector2';
import Vector3 from './Vector3';
import Vector4 from './Vector4';

test('copyArray', () => {
  const array = new Float32Array([1, 2, 3, 4]);
  const buffer = new BufferAttribute(array, 3, false);
  const dst = new Float32Array(4);

  buffer.copyArray(dst);
  expect(dst).toEqual(array);
});

test('copyColorsArray', () => {
  const buffer = new BufferAttribute(new Float32Array(6), 3);

  buffer.copyColorsArray([Color.rgb(0, 0.5, 1), Color.rgb(0.25, 1, 0)]);

  expect(buffer.array).toEqual(new Float32Array([0, 0.5, 1, 0.25, 1, 0]));
});

test('copyVector2sArray', () => {
  const buffer = new BufferAttribute(new Float32Array(4), 2);

  buffer.copyVector2sArray([new Vector2(1, 2), new Vector2(4, 5)]);

  expect(buffer.array).toEqual(new Float32Array([1, 2, 4, 5]));
});

test('copyVector3sArray', () => {
  const buffer = new BufferAttribute(new Float32Array(6), 2);

  buffer.copyVector3sArray([new Vector3(1, 2, 3), new Vector3(10, 20, 30)]);

  expect(buffer.array).toEqual(new Float32Array([1, 2, 3, 10, 20, 30]));
});

test('copyVector4sArray', () => {
  const buffer = new BufferAttribute(new Float32Array(8), 2);

  buffer.copyVector4sArray(
      [new Vector4(1, 2, 3, 4), new Vector4(10, 20, 30, 40)]);

  expect(buffer.array).toEqual(new Float32Array([1, 2, 3, 4, 10, 20, 30, 40]));
});

test('set[X, Y, Z, W, XYZ, XYZW]/get[X, Y, Z, W]', () => {
  const f32a = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8]);
  const a = new BufferAttribute(f32a, 4, false);
  const expected = new Float32Array([1, 2, -3, -4, -5, -6, 7, 8]);

  a.setX(1, a.getX(1) * -1);
  a.setY(1, a.getY(1) * -1);
  a.setZ(0, a.getZ(0) * -1);
  a.setW(0, a.getW(0) * -1);

  expect(a.array).toEqual(expected);
});

test('setXY', () => {
  const f32a = new Float32Array([1, 2, 3, 4]);
  const a = new BufferAttribute(f32a, 2, false);
  const expected = new Float32Array([-1, -2, 3, 4]);

  a.setXY(0, -1, -2);

  expect(a.array).toEqual(expected);
});

test('setXYZ', () => {
  const f32a = new Float32Array([1, 2, 3, 4, 5, 6]);
  const a = new BufferAttribute(f32a, 3, false);
  const expected = new Float32Array([1, 2, 3, -4, -5, -6]);

  a.setXYZ(1, -4, -5, -6);

  expect(a.array).toEqual(expected);
});

test('setXYZW', () => {
  const f32a = new Float32Array([1, 2, 3, 4]);
  const a = new BufferAttribute(f32a, 4, false);
  const expected = new Float32Array([-1, -2, -3, -4]);

  a.setXYZW(0, -1, -2, -3, -4);

  expect(a.array).toEqual(expected);
});

test('clone', () => {
  const attr =
      new BufferAttribute(new Float32Array([1, 2, 3, 4, 0.12, -12]), 2);
  attr.needsUpdate = true;
  const attrCopy = attr.clone();

  expect(attr.array).toEqual(attrCopy.array);
  expect(attrCopy.needsUpdate).toBeTruthy();
});

test('count', () => {
  expect(new BufferAttribute(new Float32Array([1, 2, 3, 4, 5, 6]), 3).count)
      .toEqual(2);
});
