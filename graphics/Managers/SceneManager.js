import { Scene, Color, Group } from "three";

class SceneManager {
  constructor(params) {
    this.params = params;
    this.scenes = {
      main: new Scene(),
      fbo: new Scene(),
    };
    this.groups = {
      main: new Group(),
      interactives: new Group(),
    };

    this.scenes.main.background = new Color(this.params.sceneColor);
    this.scenes.fbo.background = new Color(this.params.sceneColor);
  }
}

export default SceneManager;
