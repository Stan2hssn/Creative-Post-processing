import {
  WebGLRenderTarget,
  NearestFilter,
  RGBAFormat,
  FloatType,
  PlaneGeometry,
  ShaderMaterial,
  DataTexture,
  Mesh,
  Uniform,
  MeshBasicMaterial,
  GLSL3,
} from "three";
import Device from "../../pure/Device";
import ShadersManager from "../../Managers/ShaderManager";
import Common from "../../Common";

import Particles from "./Particles";
import Powers from "../Powers";
import Input from "../../Input";

export default class {
  params = {
    size: 528,
    count: 528 ** 2,
  };

  constructor() {}

  init() {
    this.fbo = this.getRenderTarget();
    this.fbo1 = this.getRenderTarget();

    this.setDataTexture();
    this.setInfoTexture();
    this.setSimulation();
    this.setParticles();
  }

  getRenderTarget() {
    return new WebGLRenderTarget(
      Device.viewport.width,
      Device.viewport.height,
      {
        minFilter: NearestFilter,
        magFilter: NearestFilter,
        format: RGBAFormat,
        type: FloatType,
      },
    );
  }

  setDataTexture() {
    this.data = new Float32Array(this.params.size * this.params.size * 4);

    // for (let i = 0; i < this.params.size; i++) {
    //   for (let j = 0; j < this.params.size; j++) {
    //     const index = (i * this.params.size + j) * 4;

    //     const t = Math.random() * Math.PI * 2;
    //     const x = Math.cos(t) / (1 + Math.pow(Math.sin(t), 2));
    //     const y = (Math.cos(t) * Math.sin(t)) / (1 + Math.pow(Math.sin(t), 2));
    //     const z = 0.5 * Math.sin(t);

    //     this.data[index + 0] = x;
    //     this.data[index + 1] = y;
    //     this.data[index + 2] = z;
    //     this.data[index + 3] = 0;
    //   }
    // }

    for (let i = 0; i < this.params.size; i++) {
      // Loop through the size of the data array
      for (let j = 0; j < this.params.size; j++) {
        // Donut shape
        const index = (i * this.params.size + j) * 4;
        const theta = Math.random() * Math.PI * 2;
        const r = 0.5 + Math.random() * 0;

        // Push the x, y, z, and w values to the data array
        this.data[index + 0] = Math.cos(theta) * r;
        this.data[index + 1] = Math.sin(theta) * r;
        this.data[index + 2] = 0;
        this.data[index + 3] = 1;
      }
    }

    this.dataTexture = new DataTexture(
      this.data,
      this.params.size,
      this.params.size,
      RGBAFormat,
      FloatType,
    );
    this.dataTexture.magFilter = NearestFilter;
    this.dataTexture.minFilter = NearestFilter;
    this.dataTexture.needsUpdate = true;
  }

  setInfoTexture() {
    this.info = new Float32Array(this.params.size * this.params.size * 4);

    for (let i = 0; i < this.params.size; i++) {
      // Loop through the size of the data array
      for (let j = 0; j < this.params.size; j++) {
        // Push the x, y, z, and w values to the data array
        const index = (i * this.params.size + j) * 4;

        this.info[index + 0] = 0.5 + Math.random();
        this.info[index + 1] = 0.5 + Math.random();
        this.info[index + 2] = 1;
        this.info[index + 3] = 1;
      }
    }

    this.infoTexture = new DataTexture(
      this.info,
      this.params.size,
      this.params.size,
      RGBAFormat,
      FloatType,
    );
    this.infoTexture.magFilter = NearestFilter;
    this.infoTexture.minFilter = NearestFilter;
    this.infoTexture.needsUpdate = true;
  }

  setSimulation() {
    this.geometry = new PlaneGeometry(2, 2);
    this.simMaterial = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        uMorph: new Uniform(0),
        uData: { value: this.dataTexture },
        uInfo: { value: this.infoTexture },
        tNoise: { value: Common.resources.items.curlNoise },
        uMouse: { value: Input.raycasterCoords },
      },
      vertexShader: ShadersManager.get("components", "simulation", "vertex"),
      fragmentShader: ShadersManager.get(
        "components",
        "simulation",
        "fragment",
      ),
      glslVersion: GLSL3,
    });

    this.mesh = new Mesh(this.geometry, this.simMaterial);

    Common.sceneManager.scenes.fbo.add(this.mesh);
  }

  setParticles() {
    this.points = new Particles(
      this.params.size,
      this.params.count,
      this.dataTexture,
    );

    const dummy = new Mesh(
      new PlaneGeometry(4, 4),
      new MeshBasicMaterial({ visible: false }),
    );

    Common.sceneManager.groups.main.add(this.points.particles);
    Common.sceneManager.groups.interactives.add(dummy);
  }

  dispose() {
    this.fbo.dispose();
    this.fbo1.dispose();
    this.dataTexture.dispose();
    this.infoTexture.dispose();

    this.points.geometry.dispose();
    this.points.material.dispose();
  }

  render(t) {
    const renderer = Common.rendererManager.renderer;
    this.simMaterial.uniforms.uTime.value = t;

    renderer.setRenderTarget(this.fbo);
    renderer.render(Common.sceneManager.scenes.fbo, Common.cameraManager.fbo);

    this.simMaterial.uniforms.uData.value = this.fbo.texture;

    this.points.render(t * 0.01);

    renderer.setRenderTarget(null);

    let temp = this.fbo;
    this.fbo = this.fbo1;
    this.fbo1 = temp;
  }

  resize() {}

  setDebug(debug) {
    const particlesFolder = debug.addFolder({
      title: "Particles",
    });

    particlesFolder.addBinding(
      this.simMaterial.uniforms.uMorph,
      "value",
      {
        type: "range",
        min: 0,
        max: 1,
        step: 0.01,
      },
      "Morph",
    );
  }
}
