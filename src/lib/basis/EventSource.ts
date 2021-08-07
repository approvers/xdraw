/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export default class EventSource<T> {
  private listeners: ((newValue: T) => void)[] = [];

  addEventListener(listener: (newValue: T) => void): void {
    if (this.hasEventListener(listener)) {
      return;
    }
    this.listeners.push(listener);
  }

  hasEventListener(listener: (newValue: T) => void): boolean {
    return this.listeners.indexOf(listener) >= 0;
  }

  removeEventListener(listener: (newValue: T) => void): void {
    this.listeners = this.listeners.filter((e) => e !== listener);
  }

  dispatchEvent(newValue: T): void {
    this.listeners.forEach((e) => e(newValue));
  }
}
