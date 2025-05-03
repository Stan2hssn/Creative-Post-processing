import {
  BoxGeometry,
  Mesh,
  MeshMatcapMaterial,
  ShaderMaterial,
  TextureLoader,
  Uniform,
} from "three";

import ShadersManager from "../../Managers/ShaderManager";

import AssetsManager from "../../Managers/AssetsManager";

export default class {
  params = {
    basic: 0,
  };

  constructor(posX, posY, posZ) {
    this.init(posX, posY, posZ);
  }

  init(posX = 0, posY = 0, posZ = 0) {
    this.geometry = new BoxGeometry(1, 1, 1);

    const { basic } = this.params;

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: new Uniform(0),
        default: new Uniform(basic),
      },
      vertexShader: ShadersManager.get("components", "default", "vertex"),
      fragmentShader: ShadersManager.get("components", "default", "fragment"),
    });

    this.mesh = new Mesh(this.geometry, this.material);

    this.mesh.position.set(posX, posY, posZ);
  }

  dispose() {
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }

  render(t) {
    this.mesh.material.uniforms.uTime.value = t / 60;

    this.mesh.rotation.x = Math.sin(t / 500);
    this.mesh.rotation.y = Math.cos(t / 500);
  }

  resize() {}
}
