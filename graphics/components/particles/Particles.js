import { BufferGeometry, Points, ShaderMaterial, BufferAttribute } from "three";
import ShadersManager from "../../Managers/ShaderManager";

export default class {
  constructor(size, count, dataTexture) {
    this.size = size;
    this.count = count;

    this.dataTexture = dataTexture;

    this.init();
  }

  init() {
    this.setParticles();
  }

  setParticles() {
    this.geometry = new BufferGeometry();

    this.material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPositions: { value: this.dataTexture },
      },
      vertexShader: ShadersManager.get("components", "particles", "vertex"),
      fragmentShader: ShadersManager.get("components", "particles", "fragment"),
    });

    let positions = new Float32Array(this.count * 3);
    let uv = new Float32Array(this.count * 2);

    for (let i = 0; i < this.size; i++) {
      for (let j = 0; j < this.size; j++) {
        let index = i * this.size + j;
        positions[index * 3 + 0] = Math.random();
        positions[index * 3 + 1] = Math.random();
        positions[index * 3 + 2] = 0;
        uv[index * 2 + 0] = j / this.size;
        uv[index * 2 + 1] = i / this.size;
      }
    }

    this.geometry.setAttribute("position", new BufferAttribute(positions, 3));
    this.geometry.setAttribute("uv", new BufferAttribute(uv, 2));

    this.particles = new Points(this.geometry, this.material);
    this.particles.frustumCulled = false;
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
    this.particles.geometry.dispose();
    this.particles.material.dispose();
  }

  render(t = 0) {
    this.material.uniforms.uTime.value = t;
  }

  resize() {}

  setDebug(debug) {}
}
