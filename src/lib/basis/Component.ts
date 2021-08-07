/**
 * @author MikuroXina / https://github.com/MikuroXina
 */

export interface Prop<T> {
  initValue: T;
  clamper?: (newValue: T) => T;
}

interface PropRecord<T> {
  config: Prop<T>;
  value: T;
}

export class Store {
  private props: Record<string, PropRecord<unknown>> = {};

  addProp<T>(name: string, initValue: T, clamper?: (newValue: T) => T): T {
    if (!this.props[name]) {
      this.props[name] = {
        value: initValue as unknown,
        config: {
          initValue: initValue as unknown,
          clamper: (clamper as (newValue: unknown) => unknown) || ((e) => e),
        },
      };
    }

    return this.props[name].value as T;
  }

  private state: unknown[] = [];

  private currState = 0;

  addState<T>(initValue: T): [() => T, (newValue: T) => void] {
    if (!this.state[this.currState]) {
      this.state[this.currState] = initValue;
    }

    const thisState: number = this.currState;
    this.currState += 1;

    return [
      (): T => this.state[thisState] as T,
      (newValue: T) => {
        this.state[thisState] = newValue;
      },
    ];
  }

  reset(): void {
    this.currState = 0;
  }

  addEvent(...dependencies: unknown[]): Promise<void> {
    const currentEvent = this.state[this.currState];
    const wasChanged =
      !currentEvent &&
      dependencies.some((e, i) => e !== (currentEvent as unknown[])[i]);

    const currEvent = this.currState;
    this.currState += 1;
    if (dependencies.length === 0 || wasChanged) {
      return Promise.resolve().then(() => {
        this.state[currEvent] = dependencies;
      });
    }
    return Promise.reject(new Error("dependencies not changed"));
  }
}

export class Component {
  readonly store = new Store();

  start(): void {
    // Do nothing
  }

  run(): void {
    // Do nothing
  }

  unmount(): void {
    // Do nothing
  }
}
