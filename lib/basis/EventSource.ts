/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class EventSource<T> {
  private listeners = new Array<(newValue: T) => void>();

  addEventListener(listener: (newValue: T) => void) {
    if (this.hasEventListener(listener)) {
      return;
    }
    this.listeners.push(listener);
  }

  hasEventListener(listener: (newValue: T) => void) {
    return this.listeners.indexOf(listener) !== undefined;
  }

  removeEventListener(listener: (newValue: T) => void) {
    this.listeners = this.listeners.filter(e => e !== listener);
  }

  dispatchEvent(event: {newValue: T; [key: string]: any;}) {
    this.listeners.forEach((e) => e.call(null, event));
  }
}
