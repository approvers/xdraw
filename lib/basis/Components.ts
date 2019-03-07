/**
 * @author RkEclair / https://github.com/RkEclair
 */

import EventSource from './EventSource';
import Transform from './Transform';

export class XBind<T> {
  private dispatcher = new EventSource<T>();
  constructor(
      private value: T,
      private clamper: (newValue: T) => T = (newValue) => newValue) {}

  addListener(func: (newValue: T) => void) {
    this.dispatcher.addEventListener(func);
  }

  get() {
    return this.value;
  }

  set(newValue: T) {
    this.value = this.clamper(newValue);
    this.dispatcher.dispatchEvent(newValue);
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

export type XBindMap = {
  [key: string]: XBind<any>
};

export const unmapBinds = (binds: XBindMap) =>
    Object.entries(binds).reduce((prev, e) => {
      prev[e[0]] = e[1].get();
      return prev;
    }, {}) as {[key: string]: any};

export class XStore {
  constructor(private props: {[key: string]: any} = {}) {}

  private binds: {[kind: string]: XBindMap} = {};

  addBinds(kind: string, inits: XBindMap) {
    this.binds[kind] = inits;
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

export interface XComponent {
  binds: XBindMap;
  update: ((store: XStore, t: Transform) => void)[];
}

class Component {
  enabled = true;
  constructor(public readonly component: (() => void)[]) {}

  clone() {
    const newC = new Component(this.component);
    newC.enabled = this.enabled;
    return newC;
  }
}

export default class Components {
  private componentList: Component[] = [];

  clone() {
    const newC = new Components();
    newC.componentList = this.componentList.map((e) => e.clone());
    return newC;
  }

  add(component: XComponent, transform: Transform, store: XStore) {
    const newC =
        new Component(component.update.map(e => () => e(store, transform)));
    this.componentList.push(newC);
    return newC;
  }

  update() {
    this.componentList.forEach(e => e.component.forEach(e => e()));
  }
}
