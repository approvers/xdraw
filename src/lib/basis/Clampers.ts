/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export type Clamper<V> = (newValue: V) => V;

export function rangeClamper(min: number, max: number) {
  return (newValue: number) => Math.min(Math.max(min, newValue), max);
}

export function selectClamper<T>(selects: T[]) {
  return (newValue: T) => {
    if (selects.some((e) => e === newValue)) {
      return newValue;
    }
    return selects[0];
  };
}
