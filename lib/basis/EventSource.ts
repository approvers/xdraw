/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class EventSource<T> {
  private listeners: ((newValue: T) => void)[] = [];

  addEventListener(listener: (newValue: T) => void) {
    if (this.hasEventListener(listener)) {
      return;
    }
    this.listeners.push(listener);
  }

  hasEventListener(listener: (newValue: T) => void) {
    return 0 <= this.listeners.indexOf(listener);
  }

  removeEventListener(listener: (newValue: T) => void) {
    this.listeners = this.listeners.filter(e => e !== listener);
  }

  dispatchEvent(newValue: T) {
    this.listeners.forEach((e) => e(newValue));
  }
}
