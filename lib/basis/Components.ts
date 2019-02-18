/**
 * @author RkEclair / https://github.com/RkEclair
 */

import Transform from './Transform';

export class XBind<T> {
  constructor(private value: T, private clamper: (newValue: T) => T) {}

  get() {
    return {
      value: this.value,
      set: (newValue: T) => {
        this.value = this.clamper(newValue);
      }
    };
  }
}

export function rangeClamper(min: number, max: number) {
  return (newValue: number) => Math.min(Math.max(min, newValue), max);
}

export function selectClamper(selects: string[]) {
  return (newValue: string) => {
    if (selects.some((e) => e === newValue)) return newValue;
    return selects[0];
  };
}

export class XStore {
  constructor(private props: {[key: string]: any} = {}) {}

  private binds: {[key: string]: XBind<any>} = {};

  getBindValues(key: string): any {
    return Object.keys(this.binds)
        .filter((e) => e.startsWith(key))
        .reduce((prev, e) => {
          prev[e.slice(key.length)] = {};
          prev[e.slice(key.length)] = this.binds[e].get().value;
          return prev;
        }, {});
  }

  hasBind(key: string) {
    return this.binds[key] !== undefined;
  }

  addBind<T>(
      key: string, initValue: T, clamper: (newValue: T) => T = (v: T) => v) {
    this.binds[key] = new XBind<T>(initValue, clamper);
    return this;
  }

  get(key: string) {
    return this.props[key];
  }

  has(key: string) {
    return this.props[key] !== undefined;
  }

  set(key: string, obj: any) {
    this.props[key] = obj;
    return this;
  }
}

export type XComponent = (store: XStore, transform: Transform) => XStore;

class Component {
  enabled = true;
  readonly id: number;
  constructor(public func: XComponent, private comps: Component[]) {
    this.id = comps.length;
  }

  swapComponent(to: Component) {
    const tmp = this.comps[this.id];
    this.comps[this.id] = this.comps[to.id];
    this.comps[to.id] = tmp;
  }

  removeComponent() {
    delete this.comps[this.id];
  }
}

export default class Components {
  private componentList: Component[] = [];

  clone() {
    const newC = new Components();
    this.componentList.forEach((e) => newC.addComponent(e.func));
    return newC;
  }

  addComponent(component: XComponent) {
    const newC = new Component(component, this.componentList);
    this.componentList.push(newC);
    return newC;
  }

  process(transform: Transform, initState?: {[key: string]: any}) {
    return this.componentList.reduce(
        (prev, current) => current.func(prev, transform),
        new XStore(initState));
  }
}
