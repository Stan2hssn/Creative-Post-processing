import { CanvasTexture, NearestFilter, LinearEncoding, Vector2 } from "three";
import Device from "../../pure/Device";

export class ASCIITexture {
  constructor({
    characters = "@#S%?*+=-:.",
    charSize = 8,
    fontFamily = "mono",
    backgroundColor = "#000",
    foregroundColor = "#fff",
  } = {}) {
    this.characters = characters;
    this.charSize = charSize;
    this.fontFamily = fontFamily;
    this.backgroundColor = backgroundColor;
    this.foregroundColor = foregroundColor;

    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");

    this.texture = null;
    this.charCount = new Vector2(characters.length, 1);

    this._generate();
  }

  _generate() {
    const DPR = Device.pixelRatio || 1;
    const count = this.characters.length;

    const w = this.charSize * count;
    const h = this.charSize;

    // Setup high-resolution canvas
    this.canvas.width = w * DPR;
    this.canvas.height = h * DPR;
    this.canvas.style.width = `${w}px`;
    this.canvas.style.height = `${h}px`;

    this.ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // Clear and fill background
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, w, h);

    // Draw ASCII characters
    this.ctx.fillStyle = this.foregroundColor;
    this.ctx.font = `${this.charSize}px ${this.fontFamily}`;
    this.ctx.textBaseline = "middle";
    this.ctx.textAlign = "center";

    this.characters.split("").forEach((char, i) => {
      const x = (i + 0.5) * this.charSize;
      const y = this.charSize / 2;
      this.ctx.fillText(char, x, y);
    });

    // Create or update texture
    if (this.texture) this.texture.dispose();

    this.texture = new CanvasTexture(this.canvas);
    this.texture.minFilter = NearestFilter;
    this.texture.magFilter = NearestFilter;
    this.texture.generateMipmaps = false;
    this.texture.needsUpdate = true;
  }

  update(options = {}) {
    let changed = false;

    if (options.characters && options.characters !== this.characters) {
      this.characters = options.characters;

      this.charCount.x = this.characters.length;
      changed = true;
    }
    if (options.charSize && options.charSize !== this.charSize) {
      this.charSize = options.charSize;
      changed = true;
    }

    if (changed) this._generate();
  }

  getTexture() {
    return this.texture;
  }

  getCharCount() {
    return this.charCount;
  }

  dispose() {
    if (this.texture) this.texture.dispose();
    this.texture = null;
    this.canvas = null;
    this.ctx = null;
  }
}

export default ASCIITexture;
