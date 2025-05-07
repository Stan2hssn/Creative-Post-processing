import Common from "@/Common";
import Output from "@/Output";
import Input from "@/Input";

import Stats from "stats-gl";

export default class {
  constructor({ canvas }) {
    Input.init();
    Common.init({ canvas });

    this.render = this.render.bind(this);

    Common.resources.on("assetsLoaded", () => {
      this.output = new Output();

      const href = window.location.hash;

      if (href === "#debug") {
        this.stats = new Stats({
          trackGPU: true,
          trackHz: true,
          trackCPT: true,
          logsPerSecond: 4,
          graphsPerSecond: 30,
          samplesLog: 40,
          samplesGraph: 10,
          precision: 2,
          horizontal: false,
          minimal: false,
          mode: 2,
        });

        document.body.appendChild(this.stats.dom);

        this.stats.init(Common.rendererManager.renderer);

        Common.initPane();
        this.output.setDebug(Common.pane);
      }

      this.init();
      Input.setRaycaster();
      this.render();
    });

    Common.loadAssets();
  }

  init() {
    this.resize();
    this.x = this.resize.bind(this);

    window.addEventListener("resize", this.x, false);
  }

  render(t) {
    requestAnimationFrame(this.render.bind(this));
    Input.render(t);
    Common.render(t);
    this.output.render(t);
    this.stats.update();
  }

  resize() {
    Input.resize();
    Common.resize();
    this.output.resize();
  }

  destroy() {
    window.removeEventListener("resize", this.x);

    Input.dispose();
    Common.dispose();
    this.output.dispose();
  }
}
