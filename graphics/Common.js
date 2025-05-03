import Device from "./pure/Device.js";

import Managers from "./pure/Managers.js";

class Common {
  // create a scene and the parameters for the scene
  params = {
    sceneColor: 0x222222,
    cameraFov: 50,
    cameraNear: 0.01,
    cameraFar: 100.0,
  };

  constructor() {
    this.Managers = {};
    this.render = this.render.bind(this);
  }

  init({ canvas }) {
    this.canvas = canvas;

    this.rendererManager = Managers.RendererManager({ canvas });
    this.cameraManager = Managers.CameraManager(this.params);
    this.sceneManager = Managers.SceneManager(this.params);

    this.cameraManager.setCameras();
  }

  render(t) {
    this.cameraManager.render(t);
  }

  dispose() {
    this.sceneManager.dispose();
    this.cameraManager.dispose();
    this.rendererManager.dispose();
  }

  resize() {
    const parentElement =
      this.rendererManager.renderer.domElement.parentElement;
    Device.viewport.width = parentElement.offsetWidth;
    Device.viewport.height = parentElement.offsetHeight;
    Device.pixelRatio = window.devicePixelRatio;

    const aspectRatio = Device.viewport.width / Device.viewport.height;
    Device.aspectRatio = aspectRatio;

    this.rendererManager.resize();
    this.cameraManager.resize(aspectRatio);
  }
}

export default new Common();
