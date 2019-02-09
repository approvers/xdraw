import Transform from "../../basis/Transform";
import Mesh from "../../transforms/Mesh";
import Material from "../../materials/Material";
import Camera from "../Camera";
import Scene from "../../transforms/Scene";

/**
 * @author mrdoob / http://mrdoob.com/
 * @author RkEclair / https://github.com/RkEclair
 */

function painterSortStable(a: RenderItem, b: RenderItem) {

  if (a.renderOrder !== b.renderOrder) {

    return a.renderOrder - b.renderOrder;

  } else if (a.z !== b.z) {

    return a.z - b.z;

  }
  return a.id - b.id;

}

function reversePainterSortStable(a: RenderItem, b: RenderItem) {

  if (a.renderOrder !== b.renderOrder) {

    return a.renderOrder - b.renderOrder;

  } if (a.z !== b.z) {

    return b.z - a.z;

  }
  return a.id - b.id;

}

export type RenderItem = {
  id: number,
  transform: Transform,
  mesh: Mesh,
  material: Material,
  renderOrder: number,
  z: number
};

class WebGLRenderList {

  private renderItems: RenderItem[] = [];
  private renderItemsIndex = 0;

  opaque: RenderItem[] = [];
  transparent: RenderItem[] = [];

  init() {

    this.renderItemsIndex = 0;

    this.opaque.length = 0;
    this.transparent.length = 0;

  }

  private getNextRenderItem(transform: Transform, mesh: Mesh, material: Material, z: number) {

    let renderItem = this.renderItems[this.renderItemsIndex];

    if (renderItem === undefined) {

      renderItem = {
        id: transform.id,
        transform: transform,
        mesh: mesh,
        material: material,
        renderOrder: transform.renderOrder,
        z: z,
      };

      this.renderItems[this.renderItemsIndex] = renderItem;

    } else {

      renderItem.id = transform.id;
      renderItem.transform = transform;
      renderItem.mesh = mesh;
      renderItem.material = material;
      renderItem.renderOrder = transform.renderOrder;
      renderItem.z = z;

    }

    this.renderItemsIndex++;

    return renderItem;

  }

  push(transform: Transform, mesh: Mesh, material: Material, z: number) {

    const renderItem = this.getNextRenderItem(transform, mesh, material, z);

    (material.transparent === true ? this.transparent : this.opaque).push(renderItem);

  }

  unshift(transform: Transform, mesh: Mesh, material: Material, z: number) {

    const renderItem = this.getNextRenderItem(transform, mesh, material, z);

    (material.transparent === true ? this.transparent : this.opaque).unshift(renderItem);

  }

  sort() {

    if (this.opaque.length > 1) this.opaque.sort(painterSortStable);
    if (this.transparent.length > 1) this.transparent.sort(reversePainterSortStable);

  }
}

export default class WebGLRenderLists {

  current: WebGLRenderList;

  private lists: { [scene: number]: { [camera: number]: WebGLRenderList } } = {};

  private onSceneDispose(event: { target: any; }) {
    const scene = event.target;

    scene.removeEventListener('dispose', this.onSceneDispose);

    delete this.lists[scene.id];
  }

  setCurrent(scene: Scene, camera: Camera) {

    const cameras = this.lists[scene.transform.id];
    if (cameras === undefined) {

      this.current = new WebGLRenderList();
      this.lists[scene.transform.id] = {};
      this.lists[scene.transform.id][camera.transform.id] = this.current;

      scene.addEventListener('dispose', this.onSceneDispose);

    } else {

      this.current = cameras[camera.transform.id];
      if (this.current === undefined) {

        this.current = new WebGLRenderList();
        cameras[camera.transform.id] = this.current;

      }

    }

  }

  dispose() {
    this.lists = {};
  }
}
