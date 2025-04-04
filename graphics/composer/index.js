import Device from "../pure/Device";
import Common from "../Common";

import ShaderManager from "../Managers/ShaderManager";

import vertex from "../shaders/composers/view/vertex.glsl";
import fragment from "../shaders/composers/view/fragment.glsl";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { Uniform } from "three";

import { Vector2 } from "three";

class Composer {
  params = {
    strength: 0.1,
    creditTransition: 0,
  };

  constructor() {
    const { pixelRatio, viewport } = Device;
    const { width, height } = viewport;

    this.passes = {};
    this.composers = {};

    this.composer = new EffectComposer(Common.rendererManager.renderer);
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.composer.addPass(
      new RenderPass(
        Common.sceneManager.scenes.main,
        Common.cameraManager.cameras.main,
      ),
    );

    this.mainPass = new ShaderPass({
      uniforms: {
        uTime: new Uniform(0),
        tDiffuse: { value: null },
        uResolution: new Uniform(
          new Vector2(width * pixelRatio, height * pixelRatio),
        ),
      },
      vertexShader: ShaderManager.get("composers", "view", "vertex"),
      fragmentShader: ShaderManager.get("composers", "view", "fragment"),
    });

    this.composer.addPass(this.mainPass);
  }

  render(t) {
    this.mainPass.uniforms.uTime.value = t * 0.001;

    this.composer.render();
  }

  dispose() {
    this.composer.removePass(this.mainPass);
    this.composer.dispose();
    this.mainPass.dispose();
  }

  resize() {
    const { pixelRatio, viewport } = Device;
    const { width, height } = viewport;
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.mainPass.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
  }

  debug(pane) {
    const folder = pane.addFolder({ title: "Post Processing" });
  }
}

export default Composer;
