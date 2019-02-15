"use strict";
/**
    * @author RkEclair / https://github.com/RkEclair
    */
Object.defineProperty(exports, "__esModule", { value: true });
class XBind {
    constructor(value, clamper) {
        this.value = value;
        this.clamper = clamper;
    }
    get() {
        return {
            value: this.value,
            set: (newValue) => {
                this.value = this.clamper(newValue);
            }
        };
    }
}
exports.XBind = XBind;
function rangeClamper(min, max) {
    return (newValue) => Math.min(Math.max(min, newValue), max);
}
exports.rangeClamper = rangeClamper;
function selectClamper(selects) {
    return (newValue) => {
        if (selects.some(e => e === newValue))
            return newValue;
        return selects[0];
    };
}
exports.selectClamper = selectClamper;
class XStore {
    constructor(props = {}) {
        this.props = props;
        this.binds = {};
    }
    getBindValues(key) {
        return Object.keys(this.binds).filter(e => e.startsWith(key)).reduce((prev, e) => {
            prev[e.slice(key.length)] = {};
            prev[e.slice(key.length)] = this.binds[e].get().value;
            return prev;
        }, {});
    }
    hasBind(key) {
        return this.binds[key] !== undefined;
    }
    addBind(key, initValue, clamper = (v) => v) {
        this.binds[key] = new XBind(initValue, clamper);
        return this;
    }
    get(key) {
        return this.props[key];
    }
    has(key) {
        return this.props[key] !== undefined;
    }
    set(key, obj) {
        this.props[key] = obj;
        return this;
    }
}
exports.XStore = XStore;
class Component {
    constructor(func, comps) {
        this.func = func;
        this.comps = comps;
        this.enabled = true;
        this.id = comps.length;
    }
    swapComponent(to) {
        const tmp = this.comps[this.id];
        this.comps[this.id] = this.comps[to.id];
        this.comps[to.id] = tmp;
    }
    removeComponent() {
        delete this.comps[this.id];
    }
}
class Components {
    constructor() {
        this.componentList = [];
    }
    clone() {
        const newC = new Components();
        this.componentList.forEach(e => newC.addComponent(e.func));
        return newC;
    }
    addComponent(component) {
        const newC = new Component(component, this.componentList);
        this.componentList.push(newC);
        return newC;
    }
    process(transform, initState) {
        return this.componentList.reduce((prev, current) => current.func(prev, transform), new XStore(initState));
    }
}
exports.default = Components;
