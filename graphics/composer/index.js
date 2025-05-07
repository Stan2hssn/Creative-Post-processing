import Device from "../pure/Device";
import Common from "../Common";

import ShaderManager from "../Managers/ShaderManager";

import vertex from "../shaders/composers/view/vertex.glsl";
import fragment from "../shaders/composers/view/fragment.glsl";

import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GLSL3, Uniform, Color } from "three";

import { Vector2 } from "three";
import { ASCIITexture } from "../helpers/ctx/ASCII";

class Composer {
  params = {
    strength: 0.1,
    creditTransition: 0,
  };

  constructor() {
    const { pixelRatio, viewport } = Device;
    const { width, height } = viewport;

    this.passes = {};
    this.effects = {};
    this.composers = {};
    this.switch = { value: 0 }; // Initialize switch with a default value

    this.composer = new EffectComposer(Common.rendererManager.renderer);
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.composer.addPass(
      new RenderPass(
        Common.sceneManager.scenes.main,
        Common.cameraManager.cameras.main,
      ),
    );

    this.effects.mainPass = new ShaderPass({
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

    this.primaryColor = new Color(0x000cb0);
    this.secondaryColor = new Color(0x4e5cff);

    this.effects.LinePixelPass = new ShaderPass({
      uniforms: {
        uTime: new Uniform(0),
        uPrimaryColor: new Uniform(this.primaryColor),
        uSecondaryColor: new Uniform(this.secondaryColor),
        uPixelSize: new Uniform(8),
        tDiffuse: { value: null },
        uResolution: new Uniform(
          new Vector2(width * pixelRatio, height * pixelRatio),
        ),
      },
      vertexShader: ShaderManager.get("composers", "LinePixel", "vertex"),
      fragmentShader: ShaderManager.get("composers", "LinePixel", "fragment"),
    });

    this.effects.DotEffectPass = new ShaderPass({
      uniforms: {
        uTime: new Uniform(0),
        uPrimaryColor: new Uniform(this.primaryColor),
        uSecondaryColor: new Uniform(this.secondaryColor),
        uDotSize: new Uniform(20),
        uTreshold: new Uniform(0.6),
        uThirdTone: new Uniform(true),
        tDiffuse: { value: null },
        uResolution: new Uniform(
          new Vector2(width * pixelRatio, height * pixelRatio),
        ),
      },
      vertexShader: ShaderManager.get("composers", "DotEffect", "vertex"),
      fragmentShader: ShaderManager.get("composers", "DotEffect", "fragment"),
    });

    this.asciiChars = "./ノハメラマ木";

    this.charSize = 16;

    this.ASCIITexture = new ASCIITexture({
      characters: this.asciiChars,
      charSize: this.charSize,
      fontFamily: "mono",
    });

    this.effects.ASCIIEffectPass = new ShaderPass({
      uniforms: {
        uTime: new Uniform(0),
        uPrimaryColor: new Uniform(this.primaryColor),
        uSecondaryColor: new Uniform(this.secondaryColor),
        uCharSize: new Uniform(this.charSize),
        uCharCount: new Uniform(this.asciiChars.length),
        showBackground: new Uniform(false),
        tDiffuse: { value: null },
        tASCII: { value: this.ASCIITexture.getTexture() },
        uResolution: new Uniform(
          new Vector2(width * pixelRatio, height * pixelRatio),
        ),
      },
      vertexShader: ShaderManager.get("composers", "ASCII", "vertex"),
      fragmentShader: ShaderManager.get("composers", "ASCII", "fragment"),
    });

    this.effects.CrossPatternEffect = new ShaderPass({
      uniforms: {
        uTime: new Uniform(0),
        uPrimaryColor: new Uniform(new Color(0x124ef4)),
        uSecondaryColor: new Uniform(new Color(0xb5cfe9)),
        uCrossSize: new Uniform(30),
        tDiffuse: { value: null },
        uResolution: new Uniform(
          new Vector2(width * pixelRatio, height * pixelRatio),
        ),
      },
      vertexShader: ShaderManager.get("composers", "CrossPattern", "vertex"),
      fragmentShader: ShaderManager.get(
        "composers",
        "CrossPattern",
        "fragment",
      ),
    });

    this.effects.ProvencherPatternEffect = new ShaderPass({
      uniforms: {
        uTime: new Uniform(0),
        uPrimaryColor: new Uniform(new Color(0x124ef4)),
        uSecondaryColor: new Uniform(new Color(0xb5cfe9)),
        uPatternSize: new Uniform(30),
        tDiffuse: { value: null },
        uResolution: new Uniform(
          new Vector2(width * pixelRatio, height * pixelRatio),
        ),
      },
      vertexShader: ShaderManager.get(
        "composers",
        "ProvencherPattern",
        "vertex",
      ),
      fragmentShader: ShaderManager.get(
        "composers",
        "ProvencherPattern",
        "fragment",
      ),
    });

    this.composer.addPass(this.effects.LinePixelPass);
    this.composer.addPass(this.effects.DotEffectPass);
    this.composer.addPass(this.effects.CrossPatternEffect);
    this.composer.addPass(this.effects.ASCIIEffectPass);
    this.composer.addPass(this.effects.ProvencherPatternEffect);
    this.composer.addPass(this.effects.mainPass);

    Object.values(this.effects).forEach((pass) => {
      pass.enabled = false;
    });
  }

  render(t) {
    this.effects.mainPass.uniforms.uTime.value = t * 0.001;

    this.composer.render();
  }

  dispose() {
    this.composer.removePass(this.effects.mainPass);
    this.composer.dispose();
    this.effects.mainPass.dispose();
  }

  resize() {
    const { pixelRatio, viewport } = Device;
    const { width, height } = viewport;
    this.composer.setPixelRatio(pixelRatio);
    this.composer.setSize(width, height);
    this.effects.mainPass.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
    this.effects.LinePixelPass.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
    this.effects.DotEffectPass.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );

    this.effects.ASCIIEffectPass.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
    this.effects.CrossPatternEffect.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
    this.effects.ProvencherPatternEffect.uniforms.uResolution.value.set(
      width * pixelRatio,
      height * pixelRatio,
    );
  }

  setDebug(pane) {
    const postProcessing = pane.addFolder({
      title: "🖼 Post Processing Params",
      expanded: true,
    });

    postProcessing
      .addBinding(this.switch, "value", {
        label: "Post Processing",
        view: "selector",
        options: {
          "No Post Processing": 0,
          "Line Pixel Effect": 1,
          "Dot Effect": 2,
          "ASCII Effect": 3,
          "Cross Pattern Effect": 4,
          "Provencher Pattern Effect": 5,
        },
      })
      .on("change", () => {
        Object.values(this.effects).forEach((pass) => {
          pass.enabled = false;
        });

        switch (this.switch.value) {
          case 0:
            this.composer.passes[0].enabled = true;
            break;
          case 1:
            this.effects.LinePixelPass.enabled = true;
            break;
          case 2:
            this.effects.DotEffectPass.enabled = true;
            break;
          case 3:
            this.effects.ASCIIEffectPass.enabled = true;
            break;
          case 4:
            this.effects.CrossPatternEffect.enabled = true;
            break;
          case 5:
            this.effects.ProvencherPatternEffect.enabled = true;
            break;
        }
      });

    // Folder: Line Pixel
    const linePixelFolder = pane.addFolder({
      title: "🎨 Line Pixel Effect",
      expanded: false,
    });
    linePixelFolder.addBinding(
      this.effects.LinePixelPass.uniforms.uPixelSize,
      "value",
      {
        label: "Pixel Size",
        min: 1,
        max: 100,
      },
    );
    linePixelFolder.addBinding(
      this.effects.LinePixelPass.uniforms.uTime,
      "value",
      {
        label: "Time",
        readonly: true,
      },
    );
    linePixelFolder.addBinding(
      this.effects.LinePixelPass.uniforms.uPrimaryColor,
      "value",
      {
        label: "Primary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );
    linePixelFolder.addBinding(
      this.effects.LinePixelPass.uniforms.uSecondaryColor,
      "value",
      {
        label: "Secondary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );

    // Folder: Dot Effect
    const dotEffectFolder = pane.addFolder({
      title: "🔵 Dot Effect",
      expanded: false,
    });
    dotEffectFolder.addBinding(
      this.effects.DotEffectPass.uniforms.uDotSize,
      "value",
      {
        label: "Dot Size",
        min: 1,
        max: 100,
      },
    );
    dotEffectFolder.addBinding(
      this.effects.DotEffectPass.uniforms.uTreshold,
      "value",
      {
        label: "Threshold",
        min: 0,
        max: 1,
        step: 0.01,
      },
    );
    dotEffectFolder.addBinding(
      this.effects.DotEffectPass.uniforms.uThirdTone,
      "value",
      {
        label: "Third Tone",
        view: "checkbox",
      },
    );
    dotEffectFolder.addBinding(
      this.effects.DotEffectPass.uniforms.uTime,
      "value",
      {
        label: "Time",
        readonly: true,
      },
    );
    dotEffectFolder.addBinding(
      this.effects.DotEffectPass.uniforms.uPrimaryColor,
      "value",
      {
        label: "Primary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );
    dotEffectFolder.addBinding(
      this.effects.DotEffectPass.uniforms.uSecondaryColor,
      "value",
      {
        label: "Secondary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );

    // Folder: ASCII Effect
    const asciiEffectFolder = pane.addFolder({
      title: "🔤 ASCII Effect",
      expanded: false,
    });
    asciiEffectFolder
      .addBinding(this, "asciiChars", {
        label: "Characters",
        view: "text",
      })
      .on("change", () => {
        this.ASCIITexture.update({
          characters: this.asciiChars,
          charSize: this.charSize,
        });
        this.effects.ASCIIEffectPass.uniforms.uCharCount.value =
          this.asciiChars.length;
        this.effects.ASCIIEffectPass.uniforms.tASCII.value =
          this.ASCIITexture.getTexture();
        this.effects.ASCIIEffectPass.uniforms.tASCII.value.needsUpdate = true;
      });

    asciiEffectFolder
      .addBinding(this, "charSize", {
        label: "Character Size",
        min: 1,
        max: 100,
        step: 1,
      })
      .on("change", () => {
        this.ASCIITexture.update({
          characters: this.asciiChars,
          charSize: this.charSize,
        });
        this.effects.ASCIIEffectPass.uniforms.uCharSize.value = this.charSize;
        this.effects.ASCIIEffectPass.uniforms.uCharCount.value =
          this.asciiChars.length;
        this.effects.ASCIIEffectPass.uniforms.tASCII.value =
          this.ASCIITexture.getTexture();
        this.effects.ASCIIEffectPass.uniforms.tASCII.value.needsUpdate = true;
      });

    asciiEffectFolder.addBinding(
      this.effects.ASCIIEffectPass.uniforms.showBackground,
      "value",
      {
        label: "Show Background",
        view: "checkbox",
      },
    );
    asciiEffectFolder.addBinding(
      this.effects.ASCIIEffectPass.uniforms.uTime,
      "value",
      {
        label: "Time",
        readonly: true,
      },
    );
    asciiEffectFolder.addBinding(
      this.effects.ASCIIEffectPass.uniforms.uPrimaryColor,
      "value",
      {
        label: "Primary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );
    asciiEffectFolder.addBinding(
      this.effects.ASCIIEffectPass.uniforms.uSecondaryColor,
      "value",
      {
        label: "Secondary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );

    // Folder: Cross Pattern Effect
    const crossPatternFolder = pane.addFolder({
      title: "❌ Cross Pattern Effect",
      expanded: false,
    });
    crossPatternFolder.addBinding(
      this.effects.CrossPatternEffect.uniforms.uCrossSize,
      "value",
      {
        label: "Cross Size",
        min: 1,
        max: 100,
        step: 1,
      },
    );
    crossPatternFolder.addBinding(
      this.effects.CrossPatternEffect.uniforms.uTime,
      "value",
      {
        label: "Time",
        readonly: true,
      },
    );
    crossPatternFolder.addBinding(
      this.effects.CrossPatternEffect.uniforms.uPrimaryColor,
      "value",
      {
        label: "Primary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );
    crossPatternFolder.addBinding(
      this.effects.CrossPatternEffect.uniforms.uSecondaryColor,
      "value",
      {
        label: "Secondary Color",
        view: "color",
        picker: "inline",
        color: { type: "float" },
      },
    );

    const provencherPatternFolder = pane.addFolder({
      title: "🟡 Provencher Pattern Effect",
      expanded: false,
    });

    provencherPatternFolder.addBinding(
      this.effects.ProvencherPatternEffect.uniforms.uPatternSize,
      "value",
      {
        label: "Pattern Size",
        min: 1,
        max: 100,
        step: 1,
      },
    );
  }
}

export default Composer;
