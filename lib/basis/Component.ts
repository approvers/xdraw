/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export interface PropsBase {
  [key: string]: {initValue: any, clamper?: (newValue: any) => any}
}

export class Store {
  private prop:
      {[key: string]: {value: any, clamper: (newValue: any) => any}} = {};

  addProp<T>(name: string, initValue: T, clamper?: (newValue: T) => T): T {
    if (this.prop[name] === undefined) {
      this.prop[name] = {
        value: initValue,
        clamper: (clamper || ((e: T): T => e))
      };
    }

    return this.prop[name].value;
  }

  addProps<P extends PropsBase>(props: P): void {
    for (const key in props) {
      const value = props[key];
      this.addProp(key, value.initValue, value.clamper);
    }
  }

  get props() {
    return this.prop;
  }

  private state: any[] = [];
  private currState = 0;

  addState<T>(initValue: T): [() => T, (newValue: T) => void] {
    if (this.state[this.currState] === undefined) {
      this.state[this.currState] = initValue;
    }

    const thisState: number = this.currState;
    ++this.currState;

    return [
      (): T => this.state[thisState],
      (newValue: T) => {
        this.state[thisState] = newValue;
      }
    ];
  }

  reset() {
    this.currState = 0;
  }

  addEvent(...dependencies: any[]): Promise<void> {
    const currentEvent = this.state[this.currState];
    const wasChanged = currentEvent !== undefined &&
        dependencies.some((e, i) => e !== currentEvent[i]);

    const currEvent = this.currState;
    ++this.currState;
    if (dependencies.length === 0 || wasChanged) {
      return Promise.resolve().then(() => {
        this.state[currEvent] = dependencies;
      });
    }
    return Promise.reject();
  }
}

export class Component {
  readonly store = new Store();

  constructor(props: PropsBase) {
    this.store.addProps(props);
  }

  start(): void {}
  run(): void {}
  unmount(): void {}
}
