/**
 * @author RkEclair / https://github.com/RkEclair
 */

export default class EventSource {
  private listeners: {[key: string]: Function[]} = {};

  addEventListener(type: string, listener: Function) {
    if (this.listeners[type] === undefined) {
      this.listeners[type] = [];
    }
    this.listeners[type].push(listener);
  }

  hasEventListener(type: string, listener: Function) {
    return (
      this.listeners[type] !== undefined &&
      this.listeners[type].indexOf(listener) !== -1
    );
  }

  removeEventListener(type: string, listener: Function) {
    const listenersOfType = this.listeners[type];

    if (listenersOfType !== undefined) {
      const index = listenersOfType.indexOf(listener);
      if (index !== -1) {
        listenersOfType.splice(index, 1);
      }
    }
  }

  dispatchEvent(event) {
    const listenersOfType = this.listeners[event.type];

    if (listenersOfType !== undefined) {
      event.target = this;
      listenersOfType.forEach((e) => e.call(this, event));
    }
  }
}
