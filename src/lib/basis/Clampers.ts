/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export type Clamper<V> = (newValue: V) => V;

export const rangeClamper =
  (min: number, max: number): ((newValue: number) => number) =>
  (newValue: number) =>
    Math.min(Math.max(min, newValue), max);

export const selectClamper =
  <T>(selects: T[]): ((newValue: T) => T) =>
  (newValue: T) => {
    if (selects.some((e) => e === newValue)) {
      return newValue;
    }
    return selects[0];
  };
