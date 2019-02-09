/**
 * @author supereggbert / http://www.paulbrunt.co.uk/
 * @author mrdoob / http://mrdoob.com/
 * @author alteredq / http://alteredqualia.com/
 * @author szimek / https://github.com/szimek/
 * @author tschw
 * @author RkEclair / https://github.com/RkEclair
 */

import Frustum from '../basis/Frustum';
import Matrix4 from '../basis/Matrix4';
import Vector3 from '../basis/Vector3';
import Vector4 from '../basis/Vector4';
import { ToneMapping, TraiangleDrawMode } from './DrawTypes.js';
import WebGLExtensions from './webgl/WebGLExtensions';
import WebGLCapabilities from './webgl/WebGLCapabilities';
import WebGLState from './webgl/WebGLState';
import WebGLBackground from './webgl/WebGLBackground';
import WebGLObjects from './webgl/WebGLObjects';
import WebGLGeometries from './webgl/WebGLMeshes';
import WebGLInfo from './webgl/WebGLInfo';
import Camera from './Camera';
import Transform from '../basis/Transform';
import Mesh from '../objects/Mesh';
import Material from '../materials/Material';
import WebGLAttributes from './webgl/WebGLAttributes';
import WebGLRenderLists, { RenderItem } from './webgl/WebGLRenderLists';
import GLSLShader from '../materials/GLSLShader';
import WebGLUniforms from './webgl/WebGLUniforms';
import Model from '../objects/Model';
import Scene from '../objects/Scene';
import Path from '../objects/Path';
import Points from '../materials/Points';
import WebGLRenderStates from './webgl/WebGLRenderStates';

type RendererParameters = {
  canvas?: HTMLCanvasElement;
  context?: WebGLRenderingContext;
  precision?: string;
  alpha?: boolean;
  depth?: boolean;
  stencil?: boolean;
  antialias?: boolean;
  premultipliedAlpha?: boolean;
  preserveDrawingBuffer?: boolean;
  clearColor?: number;
  clearAlpha?: number;
  devicePixelRatio?: number;
  logarithmicDepthBuffer?: boolean;
};

export default class Renderer {
  public domElement: HTMLCanvasElement;
  public context: WebGLRenderingContext;

  // clearing
  public autoClear = true;
  public autoClearColor = true;
  public autoClearDepth = true;
  public autoClearStencil = true;

  // scene graph
  public sortObjects = true;

  // user-defined clipping
  public clippingPlanes = [];
  public localClippingEnabled = false;

  // physically based shading
  public gammaFactor = 1.0;
  public gammaInput = false;
  public gammaOutput = false;

  // physical lights
  public physicallyCorrectLights = false;

  // tone mapping
  public toneMapping: ToneMapping = 'Linear';
  public toneMappingExposure = 1.0;
  public toneMappingWhitePoint = 1.0;

  // morphs
  public maxMorphTargets = 8;
  public maxMorphNormals = 4;

  // associated
  private extensions: WebGLExtensions;
  private state: WebGLState;
  private background: WebGLBackground;
  private properties: WeakMap<any, any>;
  private transforms: WebGLObjects;
  private renderLists: WebGLRenderLists;
  private renderStates: WebGLRenderStates;
  private programCache: WebGLPrograms;
  private morphtargets: WebGLMorphtargets;
  private geometries: WebGLGeometries;
  private bufferRenderer: WebGLBufferRenderer;
  private attributes: WebGLAttributes;
  private indexedBufferRenderer: WebGLIndexedBufferRenderer;
  private capabilities: WebGLCapabilities;
  private info: WebGLInfo;
  private textures: WebGLTextures;

  private isContextLost = false;
  private framebuffer = null;

  private currentRenderTarget = null;
  private currentFramebuffer = null;
  private currentMaterialId = -1;

  // mesh and program caching
  private currentGeometryProgram = {
    mesh: null,
    program: null,
    wireframe: false
  };

  private currentCamera: Camera | null;
  private currentArrayCamera: ArrayCamera | null;

  private currentViewport = new Vector4();
  private currentScissor = new Vector4();
  private currentScissorTest = null;

  private usedTextureUnits = 0;

  private width: number;
  private height: number;
  private frustum: Frustum;
  private pixelRatio = 1;

  private viewport: Vector4;
  private scissor: Vector4;
  private scissorTest = false;

  // clipping
  private clipping = new WebGLClipping();
  private clippingEnabled = false;

  // camera matrices cache
  private projScreenMatrix = new Matrix4();
  private vector3 = new Vector3();

  // vr
  private vr: VRHandler;

  // Shadow map
  private shadowMap: WebGLShadowMap;

  private gl: WebGLRenderingContext;

  constructor(options: RendererParameters = {
    alpha: true,
    depth: true,
    stencil: true,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    clearColor: 0,
    clearAlpha: 0,
    logarithmicDepthBuffer: false
  }) {
    options.canvas = options.canvas || new HTMLCanvasElement();
    this.domElement = options.canvas;
    this.width = options.canvas.width;
    this.height = options.canvas.height;
    this.viewport = new Vector4(0, 0, this.width, this.height);
    this.scissor = new Vector4(0, 0, this.width, this.height);
    // initialize

    try {
      // event listeners must be registered before WebGL context is created, see
      // #12753

      options.canvas.addEventListener(
        'webglcontextlost', this.onContextLost, false);
      options.canvas.addEventListener(
        'webglcontextrestored', this.onContextRestore, false);

      this.gl = (options.context ||
        options.canvas.getContext('webgl', options) ||
        options.canvas.getContext('experimental-webgl', options)) as WebGLRenderingContext;

      if (this.gl === null) {
        if (options.canvas.getContext('webgl') !== null) {
          throw new Error(
            'Error creating WebGL context with your selected attributes.');

        } else {
          throw new Error('Error creating WebGL context.');
        }
      }

      // Some experimental-webgl implementations do not have
      // getShaderPrecisionFormat
      if (this.gl.getShaderPrecisionFormat === undefined) {
        this.gl.getShaderPrecisionFormat = function() {
          return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };
        };
      }

    } catch (error) {
      console.error('Renderer: ' + error.message);
    }

    this.initGLContext(options);

    if (typeof navigator !== 'undefined') {
      this.vr =
        ('xr' in navigator) ? new WebXRManager(this) : new WebVRManager(this);
    }

    // shadow map
    this.shadowMap = new WebGLShadowMap(
      this, this.transforms, this.capabilities.maxTextureSize);

    // animation
    this.animation.setAnimationLoop(this.onAnimationFrame);

    if (typeof window !== 'undefined') this.animation.setContext(window);
  }

  initGLContext(options: RendererParameters) {
    let {
      extensions,
      state,
      background,
      properties,
      transforms,
      renderLists,
      renderStates,
      programCache,
      morphtargets,
      geometries,
      bufferRenderer,
      attributes,
      indexedBufferRenderer,
      capabilities,
      info,
      textures
    } = this;

    extensions = new WebGLExtensions(this.gl);

    capabilities = new WebGLCapabilities(this.gl, extensions, options);

    if (!capabilities.isWebGL2) {
      extensions.get('WEBGL_depth_texture');
      extensions.get('OES_texture_float');
      extensions.get('OES_texture_half_float');
      extensions.get('OES_texture_half_float_linear');
      extensions.get('OES_standard_derivatives');
      extensions.get('OES_element_index_uint');
      extensions.get('ANGLE_instanced_arrays');
    }

    extensions.get('OES_texture_float_linear');

    state = new WebGLState(this.gl, extensions, capabilities);
    this.currentScissor = this.scissor.clone();
    state.scissor(this.currentScissor.multiplyScalar(this.pixelRatio));
    this.currentViewport = this.viewport.clone();
    state.viewport(this.currentViewport.multiplyScalar(this.pixelRatio));

    info = new WebGLInfo(this.gl);
    properties = new WeakMap();
    textures = new WebGLTextures(
      this.gl, extensions, state, properties, capabilities, info);
    attributes = new WebGLAttributes(this.gl);
    geometries = new WebGLGeometries(this.gl, attributes, info);
    transforms = new WebGLObjects(geometries, info);
    morphtargets = new WebGLMorphtargets(this.gl);
    programCache = new WebGLPrograms(this, extensions, capabilities);
    renderLists = new WebGLRenderLists();
    renderStates = new WebGLRenderStates();

    background =
      new WebGLBackground(this, state, transforms, options.premultipliedAlpha || false);

    bufferRenderer =
      new WebGLBufferRenderer(this.gl, extensions, info, capabilities);
    indexedBufferRenderer =
      new WebGLIndexedBufferRenderer(this.gl, extensions, info, capabilities);

    info.programs = programCache.programs;

    this.context = this.gl;
  }

  getTargetPixelRatio() {
    return this.currentRenderTarget === null ? this.pixelRatio : 1;
  }

  // API
  getContext() {
    return this.gl;
  }

  getContextAttributes() {
    return this.gl.getContextAttributes();
  }

  forceContextLoss() {
    const extension = this.extensions.get('WEBGL_lose_context');
    if (extension) extension.loseContext();
  }

  forceContextRestore() {
    const extension = this.extensions.get('WEBGL_lose_context');
    if (extension) extension.restoreContext();
  }

  getPixelRatio() {
    return this.pixelRatio;
  }

  setPixelRatio(value: number) {
    this.pixelRatio = value;

    this.setSize(this.width, this.height, false);
  }

  getSize() {
    return { width: this.width, height: this.height };
  }

  setSize(width: number, height: number, updateStyle: boolean) {
    if (this.vr.isPresenting()) {
      console.warn(
        'Renderer: Can\'t change size while VR device is presenting.');
      return;
    }

    this.width = width;
    this.height = height;

    this.domElement.width = width * this.pixelRatio;
    this.domElement.height = height * this.pixelRatio;

    if (updateStyle !== false) {
      this.domElement.style.width = width + 'px';
      this.domElement.style.height = height + 'px';
    }

    this.setViewport(0, 0, width, height);
  }

  getDrawingBufferSize() {
    return {
      width: this.width * this.pixelRatio,
      height: this.height * this.pixelRatio
    };
  }

  setDrawingBufferSize(width: number, height: number, pixelRatio: number) {
    this.width = width;
    this.height = height;

    this.pixelRatio = pixelRatio;

    this.domElement.width = width * pixelRatio;
    this.domElement.height = height * pixelRatio;

    this.setViewport(0, 0, width, height);
  }

  getCurrentViewport() {
    return this.currentViewport;
  }

  setViewport(x: number, y: number, width: number, height: number) {
    this.viewport = new Vector4(x, this.height - y - height, width, height);
    this.currentViewport = this.viewport.clone();
    this.state.viewport(this.currentViewport.multiplyScalar(this.pixelRatio));
  }

  setScissor(x: number, y: number, width: number, height: number) {
    this.scissor = new Vector4(x, this.height - y - height, width, height);
    this.currentScissor = this.scissor.clone();
    this.state.scissor(this.currentScissor.multiplyScalar(this.pixelRatio));
  }

  setScissorTest(boolean: boolean) {
    this.state.setScissorTest(this.scissorTest = boolean);
  }

  // Clearing
  getClearColor() {
    return this.background.getClearColor();
  }

  setClearColor() {
    this.background.setClearColor.apply(this.background, arguments);
  }

  getClearAlpha() {
    return this.background.getClearAlpha();
  }

  setClearAlpha() {
    this.background.setClearAlpha.apply(this.background, arguments);
  }

  clear(color?: boolean, depth?: boolean, stencil?: boolean) {
    let bits = 0;

    if (color === undefined || color) bits |= this.gl.COLOR_BUFFER_BIT;
    if (depth === undefined || depth) bits |= this.gl.DEPTH_BUFFER_BIT;
    if (stencil === undefined || stencil) bits |= this.gl.STENCIL_BUFFER_BIT;

    this.gl.clear(bits);
  }

  clearColor() {
    this.clear(true, false, false);
  }

  clearDepth() {
    this.clear(false, true, false);
  }

  clearStencil() {
    this.clear(false, false, true);
  }

  //

  dispose() {
    this.domElement.removeEventListener(
      'webglcontextlost', this.onContextLost, false);
    this.domElement.removeEventListener(
      'webglcontextrestored', this.onContextRestore, false);

    this.renderLists.dispose();
    this.renderStates.dispose();
    this.properties = new WeakMap();
    this.transforms.dispose();
    this.vr.dispose();

    this.animation.stop();
  }

  // Events
  private onContextLost =
    (event) => {
      event.preventDefault();
      console.log('Context Lost.');
      this.isContextLost = true;
    }

  private onContextRestore =
    () => {
      console.log('Context Restored.');
      this.isContextLost = false;
      this.initGLContext({});
    }

  private onMaterialDispose =
    (event) => {
      const material = event.target;

      material.removeEventListener('dispose', this.onMaterialDispose);

      this.deallocateMaterial(material);
    }

  // Buffer deallocation

  deallocateMaterial(material: Material) {
    this.releaseMaterialProgramReference(material);
    this.properties.delete(material);
  }


  releaseMaterialProgramReference(material: Material) {
    const programInfo = this.properties.get(material).program;

    material.program = undefined;

    if (programInfo !== undefined) {
      this.programCache.releaseProgram(programInfo);
    }
  }

  // Buffer rendering

  renderObjectImmediate(transform: Transform, program: WebGLPrograms) {
    transform.render(function(transform) {
      this.renderBufferImmediate(transform, program);
    });
  }

  renderBufferImmediate(transform: Transform, program: WebGLPrograms) {
    this.state.initAttributes();

    const buffers = this.properties.get(transform);

    if (transform.hasPositions && !buffers.position)
      buffers.position = this.gl.createBuffer();
    if (transform.hasNormals && !buffers.normal)
      buffers.normal = this.gl.createBuffer();
    if (transform.hasUvs && !buffers.uv) buffers.uv = this.gl.createBuffer();
    if (transform.hasColors && !buffers.color)
      buffers.color = this.gl.createBuffer();

    const programAttributes = program.getAttributes();

    if (transform.hasPositions) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.position);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER, transform.positionArray, this.gl.DYNAMIC_DRAW);

      this.state.enableAttribute(programAttributes.position);
      this.gl.vertexAttribPointer(
        programAttributes.position, 3, this.gl.FLOAT, false, 0, 0);
    }

    if (transform.hasNormals) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.normal);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER, transform.normalArray, this.gl.DYNAMIC_DRAW);

      this.state.enableAttribute(programAttributes.normal);
      this.gl.vertexAttribPointer(
        programAttributes.normal, 3, this.gl.FLOAT, false, 0, 0);
    }

    if (transform.hasUvs) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.uv);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER, transform.uvArray, this.gl.DYNAMIC_DRAW);

      this.state.enableAttribute(programAttributes.uv);
      this.gl.vertexAttribPointer(
        programAttributes.uv, 2, this.gl.FLOAT, false, 0, 0);
    }

    if (transform.hasColors) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffers.color);
      this.gl.bufferData(
        this.gl.ARRAY_BUFFER, transform.colorArray, this.gl.DYNAMIC_DRAW);

      this.state.enableAttribute(programAttributes.color);
      this.gl.vertexAttribPointer(
        programAttributes.color, 3, this.gl.FLOAT, false, 0, 0);
    }

    this.state.disableUnusedAttributes();

    this.gl.drawArrays(this.gl.TRIANGLES, 0, transform.count);

    transform.count = 0;
  }

  renderBufferDirect(camera: Camera, fog: Fog, mesh: Mesh, material: Material, transform: Transform, group: Group) {
    const frontFaceCW =
      (transform.object instanceof Model && transform.normalMatrix.determinant() < 0);

    this.state.setMaterial(material, frontFaceCW);

    const program = this.setProgram(camera, fog, material, transform);

    let updateBuffers = false;

    if (this.currentGeometryProgram.mesh !== mesh.id ||
      this.currentGeometryProgram.program !== program.id ||
      this.currentGeometryProgram.wireframe !==
      (material instanceof Wireframe)) {
      this.currentGeometryProgram.mesh = mesh.id;
      this.currentGeometryProgram.program = program.id;
      this.currentGeometryProgram.wireframe = true;
      updateBuffers = true;
    }

    if (transform.morphTargetInfluences) {
      this.morphtargets.update(transform, mesh, material, program);

      updateBuffers = true;
    }

    //

    let index = mesh.index;
    const position = mesh.attributes.position;
    let rangeFactor = 1;

    if (material instanceof Wireframe) {
      index = this.geometries.getWireframeAttribute(mesh);
      rangeFactor = 2;
    }

    let renderer = this.bufferRenderer;

    if (index !== null) {
      renderer = this.indexedBufferRenderer;
      renderer.setIndex(this.attributes.get(index));
    }

    if (updateBuffers) {
      this.setupVertexAttributes(material, program, mesh);

      if (index !== null) {
        const attribute = this.attributes.get(index);
        if (attribute !== undefined) {
          this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, attribute.buffer);
        }
      }
    }

    //

    let dataCount = Infinity;

    if (index !== null) {
      dataCount = index.count;

    } else if (position !== undefined) {
      dataCount = position.count;
    }

    const rangeStart = mesh.drawRange.start * rangeFactor;
    const rangeCount = mesh.drawRange.count * rangeFactor;

    const groupStart = group !== null ? group.start * rangeFactor : 0;
    const groupCount = group !== null ? group.count * rangeFactor : Infinity;

    const drawStart = Math.max(rangeStart, groupStart);
    const drawEnd =
      Math.min(dataCount, rangeStart + rangeCount, groupStart + groupCount) -
      1;

    const drawCount = Math.max(0, drawEnd - drawStart + 1);

    if (drawCount === 0) return;

    //

    const object = transform.object;
    if (object instanceof Model) {
      if (material instanceof Wireframe) {
        this.state.setLineWidth(
          material.wireframeLinewidth * this.getTargetPixelRatio());
        renderer.setMode(this.gl.LINES);
      } else {
        switch (object.drawMode as TraiangleDrawMode) {
          case 'Normal':
            renderer.setMode(this.gl.TRIANGLES);
            break;
          case 'Strip':
            renderer.setMode(this.gl.TRIANGLE_STRIP);
            break;
          case 'Fan':
            renderer.setMode(this.gl.TRIANGLE_FAN);
            break;
        }
      }
    } else if (object instanceof Path) {
      const material = object.material;
      let lineWidth = material.linewidth;

      if (lineWidth === undefined) lineWidth = 1;  // Not using Line*Material

      this.state.setLineWidth(lineWidth * this.getTargetPixelRatio());

      if (material instanceof LineSegments) {
        renderer.setMode(this.gl.LINES);

      } else if (material instanceof LineLoop) {
        renderer.setMode(this.gl.LINE_LOOP);

      } else {
        renderer.setMode(this.gl.LINE_STRIP);
      }

    } else if (material instanceof Points) {
      renderer.setMode(this.gl.POINTS);

    } else if (object instanceof Sprite) {
      renderer.setMode(this.gl.TRIANGLES);
    }

    if (mesh && mesh.isInstancedBufferGeometry) {
      if (mesh.maxInstancedCount > 0) {
        renderer.renderInstances(mesh, drawStart, drawCount);
      }

    } else {
      renderer.render(drawStart, drawCount);
    }
  };

  setupVertexAttributes(material: Material, program: WebGLPrograms, mesh: Mesh) {
    if (mesh instanceof InstancedBufferGeometry && !this.capabilities.isWebGL2) {
      if (this.extensions.get('ANGLE_instanced_arrays') === null) {
        console.error(
          'using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
        return;
      }
    }

    this.state.initAttributes();

    const meshAttributes = mesh.attributes;

    const programAttributes = program.getAttributes();

    const materialDefaultAttributeValues = material.defaultAttributeValues();

    for (const name in programAttributes) {
      const programAttribute = programAttributes[name];

      if (programAttribute >= 0) {
        const meshAttribute = meshAttributes[name];

        if (meshAttribute !== undefined) {
          const normalized = meshAttribute.normalized;
          const size = meshAttribute.itemSize;

          const attribute = this.attributes.get(meshAttribute);

          // TODO Attribute may not be available on context restore

          if (attribute === undefined) continue;

          const buffer = attribute.buffer;
          const type = attribute.type;
          const bytesPerElement = attribute.bytesPerElement;

          if (meshAttribute.isInterleavedBufferAttribute) {
            const data = meshAttribute.data;
            const stride = data.stride;
            const offset = meshAttribute.offset;

            if (data && data.isInstancedInterleavedBuffer) {
              this.state.enableAttributeAndDivisor(
                programAttribute, data.meshPerAttribute);

              if (mesh.maxInstancedCount === undefined) {
                mesh.maxInstancedCount = data.meshPerAttribute * data.count;
              }

            } else {
              this.state.enableAttribute(programAttribute);
            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(
              programAttribute, size, type, normalized,
              stride * bytesPerElement, offset * bytesPerElement);

          } else {
            if (meshAttribute.isInstancedBufferAttribute) {
              this.state.enableAttributeAndDivisor(
                programAttribute, meshAttribute.meshPerAttribute);

              if (mesh.maxInstancedCount === undefined) {
                mesh.maxInstancedCount =
                  meshAttribute.meshPerAttribute *
                  meshAttribute.count;
              }

            } else {
              this.state.enableAttribute(programAttribute);
            }

            this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
            this.gl.vertexAttribPointer(
              programAttribute, size, type, normalized, 0, 0);
          }

        } else if (materialDefaultAttributeValues !== undefined) {
          const value = materialDefaultAttributeValues[name];

          switch (value.length) {
            case 2:
              this.gl.vertexAttrib2fv(programAttribute, value);
              break;

            case 3:
              this.gl.vertexAttrib3fv(programAttribute, value);
              break;

            case 4:
              this.gl.vertexAttrib4fv(programAttribute, value);
              break;

            default:
              this.gl.vertexAttrib1fv(programAttribute, value);
          }
        }
      }
    }

    this.state.disableUnusedAttributes();
  }

  // Compile

  compile(scene: Scene, camera: Camera) {
    this.currentRenderState = this.renderStates.get(scene, camera);
    this.currentRenderState.init();

    scene.transform.traverse(function(transform: Transform) {
      const object = transform.object;
      if (object instanceof Light) {
        this.currentRenderState.pushLight(transform);

        if (object.castShadow) {
          this.currentRenderState.pushShadow(transform);
        }
      }
    });

    this.renderStates.current.setupLights(camera);

    scene.transform.traverse(function(transform: Transform) {
      const material = transform.object.material;
      if (material) {
        this.initMaterial(transform.material, scene.fog, transform);

      } else if (transform.object.materials) {
        transform.object.materials.forEach(e => this.initMaterial(e, scene.fog, transform));
      }
    });
  }

  // Animation Loop

  private onAnimationFrameCallback: Function;
  private onAnimationFrame = (time) => {
    if (this.vr.isPresenting()) return;
    if (this.onAnimationFrameCallback) this.onAnimationFrameCallback(time);
  };
  private animation: WebGLAnimation;

  setAnimationLoop(callback: Function) {
    this.onAnimationFrameCallback = callback;
    this.vr.setAnimationLoop(callback);
    this.animation.start();
  }

  // Rendering

  render(scene: Scene, camera: Camera, renderTarget: WebGLRenderTarget, forceClear: boolean) {
    if (this.isContextLost) return;

    // reset caching for this frame

    this.currentGeometryProgram.mesh = null;
    this.currentGeometryProgram.program = null;
    this.currentGeometryProgram.wireframe = false;
    this.currentMaterialId = -1;
    this.currentCamera = null;

    // update scene graph

    if (scene.transform.autoUpdate === true) scene.transform.updateMatrixWorld();

    // update camera matrices and frustum

    if (camera.transform.parent === null) camera.transform.updateMatrixWorld();

    if (this.vr.enabled) {
      camera = this.vr.getCamera(camera);
    }

    this.renderStates.setCurrent(scene, camera);
    const currentRenderState = this.renderStates.current;
    currentRenderState.init();

    scene.dispatchEvent({
      type: 'before-render',
      renderer: this,
      scene,
      camera,
      renderTarget
    });

    this.projScreenMatrix =
      camera.projectionMatrix.multiply(camera.matrixWorldInverse);
    this.frustum.setFromMatrix(this.projScreenMatrix);

    this.localClippingEnabled = this.localClippingEnabled;
    this.clippingEnabled = this.clipping.init(
      this.clippingPlanes, this.localClippingEnabled, camera);

    this.renderLists.setCurrent(scene, camera)
    const currentRenderList = this.renderLists.current;
    currentRenderList.init();

    scene.transform.traverse((transform) => {
      this.projectObject(transform, camera, this.sortObjects);
    });

    if (this.sortObjects === true) {
      currentRenderList.sort();
    }

    //

    if (this.clippingEnabled) this.clipping.beginShadows();

    const shadowsArray = currentRenderState.state.shadowsArray;

    this.shadowMap.render(shadowsArray, scene, camera);

    currentRenderState.setupLights(camera);

    if (this.clippingEnabled) this.clipping.endShadows();

    //

    if (this.info.autoReset) this.info.reset();

    if (renderTarget === undefined) {
      renderTarget = null;
    }

    this.setRenderTarget(renderTarget);

    //

    this.background.render(currentRenderList, scene, camera, forceClear);

    // render scene

    const opaqueObjects = currentRenderList.opaque;
    const transparentObjects = currentRenderList.transparent;

    if (scene.overrideMaterial) {
      const overrideMaterial = scene.overrideMaterial;

      if (opaqueObjects.length)
        this.renderObjects(opaqueObjects, scene, camera, overrideMaterial);
      if (transparentObjects.length)
        this.renderObjects(transparentObjects, scene, camera, overrideMaterial);

    } else {
      // opaque pass (front-to-back order)

      if (opaqueObjects.length)
        this.renderObjects(opaqueObjects, scene, camera);

      // transparent pass (back-to-front order)

      if (transparentObjects.length)
        this.renderObjects(transparentObjects, scene, camera);
    }

    // Generate mipmap if we're using any kind of mipmap filtering

    if (renderTarget) {
      this.textures.updateRenderTargetMipmap(renderTarget);
    }

    // Ensure depth buffer writing is enabled so it can be cleared on next
    // render

    this.state.depthBuffer.setTest(true);
    this.state.depthBuffer.setMask(true);
    this.state.colorBuffer.setMask(true);

    this.state.setPolygonOffset(false);

    scene.dispatchEvent({
      type: 'after-render',
      renderer: this,
      scene,
      camera
    });

    if (this.vr.enabled) {
      this.vr.submitFrame();
    }
  }

  private projectObject(transform: Transform, camera: Camera, sortObjects = false) {
    if (transform.visible === false) return;

    const currentRenderList = this.renderLists.current;
    const currentRenderState = this.renderStates.current;
    const visible = transform.layers.test(camera.layers);
    const object = transform.object;

    if (visible) {
      if (object instanceof Light) {
        currentRenderState.pushLight(transform);

        if (transform.castShadow) {
          currentRenderState.pushShadow(transform);
        }

      } else if (object instanceof Sprite) {
        if (!(object instanceof CulledFrustum) || this.frustum.intersectsSprite(transform)) {
          if (sortObjects) {
            this.vector3 = Vector3.fromMatrixPosition(transform.matrixWorld);
            this.vector3.applyMatrix4(this.projScreenMatrix);
          }

          const mesh = this.transforms.update(object);
          const material = transform.object.material;

          currentRenderList.push(
            transform, mesh, material, this.vector3.z);
        }

      } else if (transform.immediateRender) {
        if (sortObjects) {
          this.vector3 = Vector3.fromMatrixPosition(transform.matrixWorld);
          this.vector3.applyMatrix4(this.projScreenMatrix);
        }

        currentRenderList.push(
          transform, null, transform.material, this.vector3.z, null);

      } else if (object instanceof Model) {
        if (object instanceof Humanoid) {
          transform.skeleton.update();
        }

        if (object instanceof CulledFrustum && this.frustum.intersectsObject(transform)) {
          if (sortObjects) {
            this.vector3 = Vector3.fromMatrixPosition(transform.matrixWorld);
            this.vector3.applyMatrix4(this.projScreenMatrix);
          }

          const mesh = this.transforms.update(transform.object);
          const materials = transform.object.materials;

          const groups = mesh.groups;

          for (const group of groups) {
            const groupMaterial = materials[group.materialIndex];

            if (groupMaterial && groupMaterial.visible) {
              this.renderLists.current.push(
                transform, mesh, groupMaterial, this.vector3.z);
            }
          }


        }
      }
    }
  }

  private renderObjects(renderList: RenderItem[], scene: Scene, camera: Camera, overrideMaterial?: Material) {
    for (const renderItem of renderList) {
      const transform = renderItem.transform;
      const mesh = renderItem.mesh;
      const material = overrideMaterial || renderItem.material;
      const group = renderItem.group;

      if (camera instanceof ArrayCamera) {
        this.currentArrayCamera = camera;

        const cameras = camera.cameras;

        for (const subCamera of cameras) {
          if (transform.layers.test(subCamera.layers)) {
            if ('viewport' in subCamera) {  // XR
              this.currentViewport = subCamera.viewport.clone();
              this.state.viewport(this.currentViewport);
            } else {
              const bounds = subCamera.bounds;
              const x = bounds.x * this.width;
              const y = bounds.y * this.height;
              const width = bounds.z * this.width;
              const height = bounds.w * this.height;

              this.state.viewport(this.currentViewport.set(x, y, width, height)
                .multiplyScalar(this.pixelRatio));
            }

            this.currentRenderState.setupLights(subCamera);

            this.renderObject(
              transform, scene, subCamera, mesh, material, group);
          }
        }
      } else {
        this.currentArrayCamera = null;
        this.renderObject(transform, scene, camera, mesh, material, group);
      }
    }
  }

  private renderObject(transform: Transform, scene: Scene, camera: Camera, mesh: Mesh, material: Material, group: Group) {
    transform.dispatchEvent({
      type: 'before-render',
      transform,
      scene,
      camera,
      mesh,
      material,
      group
    });

    this.renderStates.setCurrent(scene, this.currentArrayCamera || camera);

    transform.modelViewMatrix =
      camera.matrixWorldInverse.multiply(transform.matrixWorld);
    transform.normalMatrix = transform.normalMatrix.normalMatrix(transform.modelViewMatrix);

    if (transform.immediateRender) {
      this.state.setMaterial(material);

      const program = this.setProgram(camera, scene.fog, material, transform);

      this.currentGeometryProgram.mesh = null;
      this.currentGeometryProgram.program = null;
      this.currentGeometryProgram.wireframe = false;

      this.renderObjectImmediate(transform, program);

    } else {
      this.renderBufferDirect(
        camera, scene.fog, mesh, material, transform, group);
    }

    transform.dispatchEvent({
      type: 'after-render',
      renderer: this, scene, camera, mesh, material, group
    });

    this.renderStates.setCurrent(scene, this.currentArrayCamera || camera);
  }

  private initMaterial(material: Material, fog: Fog, transform: Transform) {
    const materialProperties = this.properties.get(material);
    const currentRenderState = this.renderStates.current;
    const lights = currentRenderState.state.lights;
    const shadowsArray = currentRenderState.state.shadowsArray;

    let lightsHash = materialProperties.lightsHash;
    const lightsStateHash = lights.state.hash;

    const parameters = this.programCache.getParameters(
      this.clipping.numPlanes, this.clipping.numIntersection, transform);

    let code = this.programCache.getProgramCode(material, parameters);

    let program = materialProperties.program;
    let programChange = true;

    if (program === undefined) {
      // new material
      material.addEventListener('dispose', this.onMaterialDispose);

    } else if (program.code !== code) {
      // changed glsl or parameters
      this.releaseMaterialProgramReference(material);

    } else if (
      lightsHash.stateID !== lightsStateHash.stateID ||
      lightsHash.directionalLength !== lightsStateHash.directionalLength ||
      lightsHash.pointLength !== lightsStateHash.pointLength ||
      lightsHash.spotLength !== lightsStateHash.spotLength ||
      lightsHash.rectAreaLength !== lightsStateHash.rectAreaLength ||
      lightsHash.hemiLength !== lightsStateHash.hemiLength ||
      lightsHash.shadowsLength !== lightsStateHash.shadowsLength) {
      lightsHash.stateID = lightsStateHash.stateID;
      lightsHash.directionalLength = lightsStateHash.directionalLength;
      lightsHash.pointLength = lightsStateHash.pointLength;
      lightsHash.spotLength = lightsStateHash.spotLength;
      lightsHash.rectAreaLength = lightsStateHash.rectAreaLength;
      lightsHash.hemiLength = lightsStateHash.hemiLength;
      lightsHash.shadowsLength = lightsStateHash.shadowsLength;

      programChange = false;

    } else if (parameters.shaderID !== undefined) {
      // same glsl and uniform list
      return;

    } else {
      // only rebuild uniform list
      programChange = false;
    }

    if (programChange) {
      if (parameters.shaderID) {
        const shader = new StandardShader(parameters.shaderID);

        materialProperties.shader = {
          name: material.type,
          uniforms: shader.uniforms.clone(),
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader
        };

      } else {
        materialProperties.shader = {
          name: material.type,
          uniforms: material.uniforms,
          vertexShader: material.vertexShader,
          fragmentShader: material.fragmentShader
        };
      }

      material.onBeforeCompile(materialProperties.shader, this);

      // Computing code again as onBeforeCompile may have changed the shaders
      code = this.programCache.getProgramCode(material, parameters);

      program = this.programCache.acquireProgram(
        material, materialProperties.shader, parameters, code);

      materialProperties.program = program;
      material.program = program;
    }

    const programAttributes = program.getAttributes();

    if (material.morphTargets) {
      material.numSupportedMorphTargets = 0;

      for (let i = 0; i < this.maxMorphTargets; i++) {
        if (programAttributes['morphTarget' + i] >= 0) {
          material.numSupportedMorphTargets++;
        }
      }
    }

    if (material.morphNormals) {
      material.numSupportedMorphNormals = 0;

      for (let i = 0; i < this.maxMorphNormals; i++) {
        if (programAttributes['morphNormal' + i] >= 0) {
          material.numSupportedMorphNormals++;
        }
      }
    }

    const uniforms = materialProperties.shader.uniforms;

    if (!material.isShaderMaterial && !material.isRawShaderMaterial ||
      material.clipping === true) {
      materialProperties.numClippingPlanes = this.clipping.numPlanes;
      materialProperties.numIntersection = this.clipping.numIntersection;
      uniforms.clippingPlanes = this.clipping.uniform;
    }

    materialProperties.fog = fog;

    // store the light setup it was created for
    if (lightsHash === undefined) {
      materialProperties.lightsHash = lightsHash = {};
    }

    lightsHash.stateID = lightsStateHash.stateID;
    lightsHash.directionalLength = lightsStateHash.directionalLength;
    lightsHash.pointLength = lightsStateHash.pointLength;
    lightsHash.spotLength = lightsStateHash.spotLength;
    lightsHash.rectAreaLength = lightsStateHash.rectAreaLength;
    lightsHash.hemiLength = lightsStateHash.hemiLength;
    lightsHash.shadowsLength = lightsStateHash.shadowsLength;

    if (material.lights) {
      // wire up the material to this renderer's lighting state

      uniforms.ambientLightColor.value = lights.state.ambient;
      uniforms.directionalLights.value = lights.state.directional;
      uniforms.spotLights.value = lights.state.spot;
      uniforms.rectAreaLights.value = lights.state.rectArea;
      uniforms.pointLights.value = lights.state.point;
      uniforms.hemisphereLights.value = lights.state.hemi;

      uniforms.directionalShadowMap.value = lights.state.directionalShadowMap;
      uniforms.directionalShadowMatrix.value =
        lights.state.directionalShadowMatrix;
      uniforms.spotShadowMap.value = lights.state.spotShadowMap;
      uniforms.spotShadowMatrix.value = lights.state.spotShadowMatrix;
      uniforms.pointShadowMap.value = lights.state.pointShadowMap;
      uniforms.pointShadowMatrix.value = lights.state.pointShadowMatrix;
      // TODO (abelnation): add area lights shadow info to uniforms
    }

    const progUniforms = materialProperties.program.getUniforms(),
      uniformsList = WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);

    materialProperties.uniformsList = uniformsList;
  }

  private setProgram(camera: Camera, fog, material: Material, transform: Transform) {
    this.usedTextureUnits = 0;

    const materialProperties = this.properties.get(material);
    const lights = this.currentRenderState.state.lights;

    const lightsHash = materialProperties.lightsHash;
    const lightsStateHash = lights.state.hash;

    if (this.clippingEnabled) {
      if (this.localClippingEnabled || camera !== this.currentCamera) {
        const useCache = camera === this.currentCamera &&
          material.id === this.currentMaterialId;

        // we might want to call this function with some ClippingGroup
        // transform instead of the material, once it becomes feasible
        // (#8465, #8379)
        this.clipping.setState(
          material.clippingPlanes, material.clipIntersection,
          material.clipShadows, camera, materialProperties, useCache);
      }
    }

    if (material.needsUpdate === false) {
      if (materialProperties.program === undefined) {
        material.needsUpdate = true;

      } else if (material.fog && materialProperties.fog !== fog) {
        material.needsUpdate = true;

      } else if (
        material.lights &&
        (lightsHash.stateID !== lightsStateHash.stateID ||
          lightsHash.directionalLength !== lightsStateHash.directionalLength ||
          lightsHash.pointLength !== lightsStateHash.pointLength ||
          lightsHash.spotLength !== lightsStateHash.spotLength ||
          lightsHash.rectAreaLength !== lightsStateHash.rectAreaLength ||
          lightsHash.hemiLength !== lightsStateHash.hemiLength ||
          lightsHash.shadowsLength !== lightsStateHash.shadowsLength)) {
        material.needsUpdate = true;

      } else if (
        materialProperties.numClippingPlanes !== undefined &&
        (materialProperties.numClippingPlanes !== this.clipping.numPlanes ||
          materialProperties.numIntersection !==
          this.clipping.numIntersection)) {
        material.needsUpdate = true;
      }
    }

    if (material.needsUpdate) {
      this.initMaterial(material, fog, transform);
      material.needsUpdate = false;
    }

    let refreshProgram = false;
    let refreshMaterial = false;
    let refreshLights = false;

    const program = materialProperties.program,
      p_uniforms = program.getUniforms(),
      m_uniforms = materialProperties.shader.uniforms;

    if (this.state.useProgram(program.program)) {
      refreshProgram = true;
      refreshMaterial = true;
      refreshLights = true;
    }

    if (material.id !== this.currentMaterialId) {
      this.currentMaterialId = material.id;

      refreshMaterial = true;
    }

    if (refreshProgram || this.currentCamera !== camera) {
      p_uniforms.setValue(this.gl, 'projectionMatrix', camera.projectionMatrix);

      if (this.capabilities.logarithmicDepthBuffer) {
        p_uniforms.setValue(
          this.gl, 'logDepthBufFC',
          2.0 / (Math.log(camera.far + 1.0) / Math.LN2));
      }

      if (this.currentCamera !== camera) {
        this.currentCamera = camera;

        // lighting uniforms depend on the camera so enforce an update
        // now, in case this material supports lights - or later, when
        // the next material that does gets activated:

        refreshMaterial = true;  // set to true on material change
        refreshLights = true;    // remains set until update done
      }

      // load material specific uniforms
      // (shader material also gets them for the sake of genericity)

      if (material.isShaderMaterial || material.isMeshPhongMaterial ||
        material.isMeshStandardMaterial || material.envMap) {
        const uCamPos = p_uniforms.map.cameraPosition;

        if (uCamPos !== undefined) {
          this.vector3 = camera.matrixWorld.clone();
          uCamPos.setValue(this.gl, this.vector3);
        }
      }

      if (material.isMeshPhongMaterial || material.isMeshLambertMaterial ||
        material.isMeshBasicMaterial || material.isMeshStandardMaterial ||
        material.isShaderMaterial || material.skinning) {
        p_uniforms.setValue(this.gl, 'viewMatrix', camera.matrixWorldInverse);
      }
    }

    // skinning uniforms must be set even if material didn't change
    // auto-setting of texture unit for bone texture must go before other
    // textures not sure why, but otherwise weird things happen

    if (material.skinning) {
      p_uniforms.setOptional(this.gl, transform, 'bindMatrix');
      p_uniforms.setOptional(this.gl, transform, 'bindMatrixInverse');

      const skeleton = transform.skeleton;

      if (skeleton) {
        const bones = skeleton.bones;

        if (this.capabilities.floatVertexTextures) {
          if (skeleton.boneTexture === undefined) {
            // layout (1 matrix = 4 pixels)
            //      RGBA RGBA RGBA RGBA (=> column1, column2, column3,
            //      column4)
            //  with  8x8  pixel texture max   16 bones * 4 pixels =  (8 * 8)
            //       16x16 pixel texture max   64 bones * 4 pixels = (16 * 16)
            //       32x32 pixel texture max  256 bones * 4 pixels = (32 * 32)
            //       64x64 pixel texture max 1024 bones * 4 pixels = (64 * 64)


            let size =
              Math.sqrt(bones.length * 4);  // 4 pixels needed for 1 matrix
            size = Math.pow(2, Math.ceil(Math.log(size) / Math.LN2));
            size = Math.max(size, 4);

            const boneMatrices =
              new Float32Array(size * size * 4);    // 4 floats per RGBA pixel
            boneMatrices.set(skeleton.boneMatrices);  // copy current values

            const boneTexture =
              new DataTexture(boneMatrices, size, size, 'RGBA', 'Float');
            boneTexture.needsUpdate = true;

            skeleton.boneMatrices = boneMatrices;
            skeleton.boneTexture = boneTexture;
            skeleton.boneTextureSize = size;
          }

          p_uniforms.setValue(this.gl, 'boneTexture', skeleton.boneTexture);
          p_uniforms.setValue(
            this.gl, 'boneTextureSize', skeleton.boneTextureSize);

        } else {
          p_uniforms.setOptional(this.gl, skeleton, 'boneMatrices');
        }
      }
    }

    if (refreshMaterial) {
      p_uniforms.setValue(
        this.gl, 'toneMappingExposure', this.toneMappingExposure);
      p_uniforms.setValue(
        this.gl, 'toneMappingWhitePoint', this.toneMappingWhitePoint);

      if (material.lights) {
        // the current material requires lighting info

        // note: all lighting uniforms are always set correctly
        // they simply reference the renderer's state for their
        // values
        //
        // use the current material's .needsUpdate flags to set
        // the GL state when required

        this.markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);
      }

      // refresh uniforms common to several materials

      if (fog && material.fog) {
        this.refreshUniformsFog(m_uniforms, fog);
      }

      if (material.isMeshBasicMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);

      } else if (material.isMeshLambertMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);
        this.refreshUniformsLambert(m_uniforms, material);

      } else if (material.isMeshPhongMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);

        if (material.isMeshToonMaterial) {
          this.refreshUniformsToon(m_uniforms, material);

        } else {
          this.refreshUniformsPhong(m_uniforms, material);
        }

      } else if (material.isMeshStandardMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);

        if (material.isMeshPhysicalMaterial) {
          this.refreshUniformsPhysical(m_uniforms, material);

        } else {
          this.refreshUniformsStandard(m_uniforms, material);
        }

      } else if (material.isMeshMatcapMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);

        this.refreshUniformsMatcap(m_uniforms, material);

      } else if (material.isMeshDepthMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);
        this.refreshUniformsDepth(m_uniforms, material);

      } else if (material.isMeshDistanceMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);
        this.refreshUniformsDistance(m_uniforms, material);

      } else if (material.isMeshNormalMaterial) {
        this.refreshUniformsCommon(m_uniforms, material);
        this.refreshUniformsNormal(m_uniforms, material);

      } else if (material.isLineBasicMaterial) {
        this.refreshUniformsLine(m_uniforms, material);

        if (material.isLineDashedMaterial) {
          this.refreshUniformsDash(m_uniforms, material);
        }

      } else if (material.isPointsMaterial) {
        this.refreshUniformsPoints(m_uniforms, material);

      } else if (material.isSpriteMaterial) {
        this.refreshUniformsSprites(m_uniforms, material);

      } else if (material.isShadowMaterial) {
        m_uniforms.color.value = material.color;
        m_uniforms.opacity.value = material.opacity;
      }

      WebGLUniforms.upload(
        this.gl, materialProperties.uniformsList, m_uniforms, this);
    }

    if (material instanceof GLSLShader && material.uniformsNeedUpdate === true) {
      WebGLUniforms.upload(
        this.gl, materialProperties.uniformsList, m_uniforms, this);
      material.uniformsNeedUpdate = false;
    }

    if (material.isSpriteMaterial) {
      p_uniforms.setValue(this.gl, 'center', transform.center);
    }

    // common matrices

    p_uniforms.setValue(this.gl, 'modelViewMatrix', transform.modelViewMatrix);
    p_uniforms.setValue(this.gl, 'normalMatrix', transform.normalMatrix);
    p_uniforms.setValue(this.gl, 'modelMatrix', transform.matrixWorld);

    return program;
  }

  // Uniforms (refresh uniforms transforms)

  private refreshUniformsCommon(uniforms: Uniforms, material) {
    uniforms.opacity.value = material.opacity;

    if (material.color) {
      uniforms.diffuse.value = material.color;
    }

    if (material.emissive) {
      uniforms.emissive.value.copy(material.emissive)
        .multiplyScalar(material.emissiveIntensity);
    }

    if (material.map) {
      uniforms.map.value = material.map;
    }

    if (material.alphaMap) {
      uniforms.alphaMap.value = material.alphaMap;
    }

    if (material.specularMap) {
      uniforms.specularMap.value = material.specularMap;
    }

    if (material.envMap) {
      uniforms.envMap.value = material.envMap;

      // don't flip CubeTexture envMaps, flip everything else:
      //  WebGLRenderTargetCube will be flipped for backwards compatibility
      //  WebGLRenderTargetCube.texture will be flipped because it's a Texture
      //  and NOT a CubeTexture
      // this check must be handled differently, or removed entirely, if
      // WebGLRenderTargetCube uses a CubeTexture in the future
      uniforms.flipEnvMap.value = material.envMap.isCubeTexture ? -1 : 1;

      uniforms.reflectivity.value = material.reflectivity;
      uniforms.refractionRatio.value = material.refractionRatio;

      uniforms.maxMipLevel.value =
        this.properties.get(material.envMap).__maxMipLevel;
    }

    if (material.lightMap) {
      uniforms.lightMap.value = material.lightMap;
      uniforms.lightMapIntensity.value = material.lightMapIntensity;
    }

    if (material.aoMap) {
      uniforms.aoMap.value = material.aoMap;
      uniforms.aoMapIntensity.value = material.aoMapIntensity;
    }

    // uv repeat and offset setting priorities
    // 1. color map
    // 2. specular map
    // 3. normal map
    // 4. bump map
    // 5. alpha map
    // 6. emissive map

    let uvScaleMap;

    if (material.map) {
      uvScaleMap = material.map;

    } else if (material.specularMap) {
      uvScaleMap = material.specularMap;

    } else if (material.displacementMap) {
      uvScaleMap = material.displacementMap;

    } else if (material.normalMap) {
      uvScaleMap = material.normalMap;

    } else if (material.bumpMap) {
      uvScaleMap = material.bumpMap;

    } else if (material.roughnessMap) {
      uvScaleMap = material.roughnessMap;

    } else if (material.metalnessMap) {
      uvScaleMap = material.metalnessMap;

    } else if (material.alphaMap) {
      uvScaleMap = material.alphaMap;

    } else if (material.emissiveMap) {
      uvScaleMap = material.emissiveMap;
    }

    if (uvScaleMap !== undefined) {
      // backwards compatibility
      if (uvScaleMap.isWebGLRenderTarget) {
        uvScaleMap = uvScaleMap.texture;
      }

      if (uvScaleMap.matrixAutoUpdate === true) {
        uvScaleMap.updateMatrix();
      }

      uniforms.uvTransform.value.copy(uvScaleMap.matrix);
    }
  }

  // If uniforms are marked as clean, they don't need to be loaded to the GPU.

  private markUniformsLightsNeedsUpdate(uniforms, value) {
    uniforms.ambientLightColor.needsUpdate = value;

    uniforms.directionalLights.needsUpdate = value;
    uniforms.pointLights.needsUpdate = value;
    uniforms.spotLights.needsUpdate = value;
    uniforms.rectAreaLights.needsUpdate = value;
    uniforms.hemisphereLights.needsUpdate = value;
  }

  // Textures

  private allocTextureUnit =
    () => {
      const textureUnit = this.usedTextureUnits;

      if (textureUnit >= this.capabilities.maxTextures) {
        console.warn(`Trying to use ${
          textureUnit} texture units while this GPU supports only ${
          this.capabilities.maxTextures}`);
      }

      this.usedTextureUnits += 1;

      return textureUnit;
    }

  private setTexture2D = (texture, slot) => {
    let warned = false;

    if (texture && texture.isWebGLRenderTarget) {
      if (!warned) {
        console.warn(
          'don\'t use render targets as textures. Use their .texture property instead.');
        warned = true;
      }

      texture = texture.texture;
    }

    this.textures.setTexture2D(texture, slot);
  };

  private setTexture3D = (texture, slot) => {
    this.textures.setTexture3D(texture, slot);
  };

  private setTexture = (texture, slot) => {
    let warned = false;

    if (!warned) {
      console.warn(
        'WebGLRenderer: .setTexture is deprecated, use setTexture2D instead.');
      warned = true;
    }

    this.textures.setTexture2D(texture, slot);
  };

  private setTextureCube = (texture, slot) => {
    let warned = false;

    // backwards compatibility: peel texture.texture
    if (texture && texture.isWebGLRenderTargetCube) {
      if (!warned) {
        console.warn(
          'don\'t use cube render targets as textures. Use their .texture property instead.');
        warned = true;
      }

      texture = texture.texture;
    }

    // currently relying on the fact that WebGLRenderTargetCube.texture is
    // a Texture and NOT a CubeTexture
    // TODO: unify these code paths
    if ((texture && texture.isCubeTexture) ||
      (Array.isArray(texture.image) && texture.image.length === 6)) {
      // CompressedTexture can have Array in image :/

      // this function alone should take care of cube textures
      this.textures.setTextureCube(texture, slot);

    } else {
      // assumed: texture property of WebGLRenderTargetCube

      this.textures.setTextureCubeDynamic(texture, slot);
    }
  };

  //

  setFramebuffer(value) {
    this.framebuffer = value;
  }

  getRenderTarget() {
    return this.currentRenderTarget;
  }

  private setRenderTarget(renderTarget) {
    this.currentRenderTarget = renderTarget;

    if (renderTarget &&
      this.properties.get(renderTarget).__webglFramebuffer === undefined) {
      this.textures.setupRenderTarget(renderTarget);
    }

    let framebuffer = this.framebuffer;
    let isCube = false;

    if (renderTarget) {
      const __webglFramebuffer =
        this.properties.get(renderTarget).__webglFramebuffer;

      if (renderTarget.isWebGLRenderTargetCube) {
        framebuffer = __webglFramebuffer[renderTarget.activeCubeFace];
        isCube = true;

      } else {
        framebuffer = __webglFramebuffer;
      }

      this.currentViewport = renderTarget.viewport.clone();
      this.currentScissor = renderTarget.scissor.clone();
      this.currentScissorTest = renderTarget.scissorTest;

    } else {
      this.currentViewport = this.viewport.clone();
      this.currentScissor = this.scissor.clone();
      this.currentViewport.multiplyScalar(this.pixelRatio);
      this.currentScissor.multiplyScalar(this.pixelRatio);
      this.currentScissorTest = this.scissorTest;
    }

    if (this.currentFramebuffer !== framebuffer) {
      this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
      this.currentFramebuffer = framebuffer;
    }

    this.state.viewport(this.currentViewport);
    this.state.scissor(this.currentScissor);
    this.state.setScissorTest(this.currentScissorTest);

    if (isCube) {
      const textureProperties = this.properties.get(renderTarget.texture);
      this.gl.framebufferTexture2D(
        this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0,
        this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace,
        textureProperties.__webglTexture, renderTarget.activeMipMapLevel);
    }
  };

  private readRenderTargetPixels(renderTarget, x, y, width, height, buffer) {
    if (!(renderTarget && renderTarget.isWebGLRenderTarget)) {
      console.error('renderTarget is not WebGLRenderTarget.');
      return;
    }

    const framebuffer = this.properties.get(renderTarget).__webglFramebuffer;

    if (framebuffer) {
      let restore = false;

      if (framebuffer !== this.currentFramebuffer) {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

        restore = true;
      }

      try {
        const texture = renderTarget.texture;
        const textureFormat = texture.format;
        const textureType = texture.type;

        if (textureFormat !== 'RGBA' &&
          this.utils.convert(textureFormat) !==
          this.gl.getParameter(
            this.gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {
          console.error(
            'renderTarget is not in RGBA or implementation defined format.');
          return;
        }

        if (textureType !== 'UnsignedByte' &&
          this.utils.convert(textureType) !==
          this.gl.getParameter(
            this.gl.IMPLEMENTATION_COLOR_READ_TYPE) &&  // IE11, Edge
          // and Chrome
          // Mac < 52
          // (#9513)
          !(textureType === 'Float' &&
            (this.capabilities.isWebGL2 ||
              this.extensions.get('OES_texture_float') ||
              this.extensions.get(
                'WEBGL_color_buffer_float'))) &&  // Chrome Mac >=
          // 52 and Firefox
          !(textureType === 'HalfFloat' &&
            (this.capabilities.isWebGL2 ?
              this.extensions.get('EXT_color_buffer_float') :
              this.extensions.get('EXT_color_buffer_half_float')))) {
          console.error(
            'renderTarget is not in UnsignedByteType or implementation defined type.');
          return;
        }

        if (this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) ===
          this.gl.FRAMEBUFFER_COMPLETE) {
          // the following if statement ensures valid read requests (no
          // out-of-bounds pixels, see #8604)

          if ((x >= 0 && x <= (renderTarget.width - width)) &&
            (y >= 0 && y <= (renderTarget.height - height))) {
            this.gl.readPixels(
              x, y, width, height, this.utils.convert(textureFormat),
              this.utils.convert(textureType), buffer);
          }

        } else {
          console.error(
            'readPixels from renderTarget failed. Framebuffer not complete.');
        }

      } finally {
        if (restore) {
          this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.currentFramebuffer);
        }
      }
    }
  };

  copyFramebufferToTexture(position, texture, level) {
    const width = texture.image.width;
    const height = texture.image.height;
    const glFormat = this.utils.convert(texture.format);

    this.setTexture2D(texture, 0);

    this.gl.copyTexImage2D(
      this.gl.TEXTURE_2D, level || 0, glFormat, position.x, position.y, width,
      height, 0);
  }

  copyTextureToTexture(position, srcTexture, dstTexture, level) {
    const width = srcTexture.image.width;
    const height = srcTexture.image.height;
    const glFormat = this.utils.convert(dstTexture.format);
    const glType = this.utils.convert(dstTexture.type);

    this.setTexture2D(dstTexture, 0);

    if (srcTexture.isDataTexture) {
      this.gl.texSubImage2D(
        this.gl.TEXTURE_2D, level || 0, position.x, position.y, width, height,
        glFormat, glType, srcTexture.image.data);

    } else {
      this.gl.texSubImage2D(
        this.gl.TEXTURE_2D, level || 0, position.x, position.y, glFormat,
        glType, srcTexture.image);
    }
  };
}
