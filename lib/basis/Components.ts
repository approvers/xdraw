/**
	* @author RkEclair / https://github.com/RkEclair
	*/

export class XStore {
  constructor(private props: { [key: string]: any } = {}) { }

  get(key: string) {
    return this.props[key];
  }

  has(key: string) {
    return this.props[key] !== undefined;
  }

  set(key: string, obj: any) {
    this.props[key] = obj;
  }
}

export type XComponent = (store: XStore) => XStore;

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

  process(initState?: { [key: string]: any }) {
    return this.componentList.reduce((prev, current) => current.func(prev), new XStore(initState));
  }
}
