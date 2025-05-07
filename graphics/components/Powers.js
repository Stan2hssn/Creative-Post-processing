import Common from "@/Common.js";

import MouseTrail from "@/components/preComponents/MouseTrail.js";
import Particles from "./particles/index.js";
import {
  TorusKnotGeometry,
  MeshBasicMaterial,
  Mesh,
  MeshDistanceMaterial,
  MeshStandardMaterial,
  AmbientLight,
  DirectionalLight,
} from "three";

export default class {
  PreComponents = {
    mouseTrail: null,
  };
  Components = {
    particles: null,
  };

  constructor() {
    this.init();
  }

  init() {
    this.initPreComponents();
    this.initComponents();

    const mainGroup = Common.sceneManager.groups.main;
    const interactivesGroup = Common.sceneManager.groups.interactives;
    const scene = Common.sceneManager.scenes.main;

    this.knot = new TorusKnotGeometry(0.5, 0.2, 100, 16);

    this.knotMaterial = new MeshStandardMaterial({
      color: "orange",
    });

    const ambiantLight = new AmbientLight(0xffffff, 0.2);
    const directionalLight = new DirectionalLight(0xffffff, 7);
    directionalLight.castShadow = true;
    directionalLight.lookAt(0, 0, 0);
    directionalLight.position.set(5, 10, -5);

    this.knotMesh = new Mesh(this.knot, this.knotMaterial);

    mainGroup.add(this.knotMesh, ambiantLight, directionalLight);

    scene.add(mainGroup, interactivesGroup);
  }

  // create precomponents
  createPreComponents() {
    this.PreComponents = {
      // mouseTrail: new MouseTrail(),
    };
  }

  // create components
  createComponents() {
    this.Components = {
      // particles: new Particles(),
    };
  }

  // PreComponents
  initPreComponents() {
    this.createPreComponents();

    Object.keys(this.PreComponents).forEach((key) => {
      if (typeof this.PreComponents[key].init === "function")
        this.PreComponents[key].init();
    });
  }

  // Components
  initComponents() {
    this.createComponents();

    Object.keys(this.Components).forEach((key) => {
      if (typeof this.Components[key].init === "function")
        this.Components[key].init();
    });
  }

  dispose() {
    Object.keys(this.PreComponents).forEach((key) => {
      if (typeof this.PreComponents[key].dispose !== "function") return;
      this.PreComponents[key].dispose();
    });

    Object.keys(this.Components).forEach((key) => {
      if (typeof this.Components[key].dispose !== "function") return;
      this.Components[key].dispose();
    });

    Common.sceneManager.scenes.main.remove(this.ComponentsGroup);
    this.ComponentsGroup.removeFromParent();
    this.ComponentsGroup.clear();
    this.ComponentsGroup = null;
    this.Components = null;
    this.PreComponents = null;
    this.dispose = () => {};
  }

  render(t) {
    Object.keys(this.PreComponents).forEach((key) => {
      if (typeof this.PreComponents[key].render !== "function") return;
      this.PreComponents[key].render(t);
    });

    Object.keys(this.Components).forEach((key) => {
      if (typeof this.Components[key].render !== "function") return;
      this.Components[key].render(t);
    });
  }

  resize() {
    Object.keys(this.PreComponents).forEach((key) => {
      if (typeof this.PreComponents[key].resize !== "function") return;
      this.PreComponents[key].resize();
    });

    Object.keys(this.Components).forEach((key) => {
      if (typeof this.Components[key].resize !== "function") return;
      this.Components[key].resize();
    });
  }

  setDebug(pane) {
    Object.keys(this.PreComponents).forEach((key) => {
      if (typeof this.PreComponents[key].setDebug !== "function") return;
      this.PreComponents[key].setDebug(pane);
    });

    Object.keys(this.Components).forEach((key) => {
      if (typeof this.Components[key].setDebug !== "function") return;
      this.Components[key].setDebug(pane);
    });
  }
}
