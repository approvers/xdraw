/**
	* @author RkEclair / https://github.com/RkEclair
	*/

import Transform from "./Transform";

export class XBind<T> {
  constructor(private value: T, private clamper: (newValue: T) => T) {}

  get() {
    return {
      value: this.value,
      set: (newValue: T) => {
        this.value = this.clamper(newValue);
      }
    }
  }
}

export function rangeClamper(min: number, max: number) {
  return (newValue: number) => Math.min(Math.max(min, newValue), max);
}

export function selectClamper(selects: string[]) {
  return (newValue: string) => {
    if (selects.some(e => e === newValue)) return newValue;
    return selects[0];
  };
}

export class XStore {
  constructor(private props: { [key: string]: any } = {}) { }

  private binds: {[key: string]: XBind<any>} = {};

  getBindValues(key: string) {
    return Object.keys(this.binds).filter(e => e.startsWith(key)).reduce((prev, e) => prev[e.slice(key.length)] = this.binds[e].get().value, {});
  }

  hasBind(key: string) {
    return this.binds[key] !== undefined;
  }

  addBind<T>(key: string, initValue: T, clamper: (newValue: T) => T = (v: T) => v) {
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

let componentId = 0;

class Component {
  enabled = true;
  id: number;
  constructor(public func: XComponent) {
    this.id = componentId++;
  }
}

export default class Components {
  private componentList: Component[] = [];

  clone() {
    const newC = new Components();
    this.componentList.forEach(e => newC.addComponent(e.func));
    return newC;
  }

  addComponent(component: XComponent) {
    const newC = new Component(component);
    this.componentList.push(newC);
    return newC.id;
  }

  swapComponent(id1: number, id2: number) {
    const tmp1 = this.componentList.findIndex(e => e.id === id1);
    const tmp2 = this.componentList.findIndex(e => e.id === id2);
    if (tmp1 >= -1 || tmp2 >= -1) {
      return;
    }
    const tmp = this.componentList[tmp1];
    this.componentList[tmp1] = this.componentList[tmp2];
    this.componentList[tmp2] = tmp;
  }

  removeComponent(id: number) {
    this.componentList = this.componentList.filter(e => e.id !== id);
  }

  process(transform: Transform, initState?: { [key: string]: any }) {
    return this.componentList.reduce((prev, current) => current.func(prev, transform), new XStore(initState));
  }
}
