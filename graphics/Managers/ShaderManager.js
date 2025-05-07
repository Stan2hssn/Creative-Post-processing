import viewVertexShader from "@/shaders/composers/view/vertex.glsl";
import viewFragmentShader from "@/shaders/composers/view/fragment.glsl";

import defaultVertexShader from "@/shaders/components/default/vertex.glsl";
import defaultFragmentShader from "@/shaders/components/default/fragment.glsl";

import simulationVertexShader from "@/shaders/components/simulation/simulation.vert";
import simulationFragmentShader from "@/shaders/components/simulation/simulation.frag";

import particlesVertexShader from "@/shaders/components/particles/particles.vert";
import particlesFragmentShader from "@/shaders/components/particles/particles.frag";

import trailShader from "@/shaders/components/preComponents/trail.glsl";

import ASCIIVertexShader from "@/shaders/composers/ASCII/ASCII.vert";
import ASCIIFragmentShader from "@/shaders/composers/ASCII/ASCII.frag";

import LinePixelVertexShader from "@/shaders/composers/LinePixel/LinePixel.vert";
import LinePixelFragmentShader from "@/shaders/composers/LinePixel/LinePixel.frag";

import DotEffectVertexShader from "@/shaders/composers/DotEffect/DotEffect.vert";
import DotEffectFragmentShader from "@/shaders/composers/DotEffect/DotEffect.frag";

import CrossPatternVertexShader from "@/shaders/composers/CrossPattern/CrossPattern.vert";
import CrossPatternFragmentShader from "@/shaders/composers/CrossPattern/CrossPattern.frag";

import ProvencherPatternVertexShader from "@/shaders/composers/ProvencherPattern/ProvencherPattern.vert";
import ProvencherPatternFragmentShader from "@/shaders/composers/ProvencherPattern/ProvencherPattern.frag";

const Shaders = {
  composers: {
    view: {
      vertex: viewVertexShader,
      fragment: viewFragmentShader,
    },
    ASCII: {
      vertex: ASCIIVertexShader,
      fragment: ASCIIFragmentShader,
    },
    LinePixel: {
      vertex: LinePixelVertexShader,
      fragment: LinePixelFragmentShader,
    },
    DotEffect: {
      vertex: DotEffectVertexShader,
      fragment: DotEffectFragmentShader,
    },
    CrossPattern: {
      vertex: CrossPatternVertexShader,
      fragment: CrossPatternFragmentShader,
    },
    ProvencherPattern: {
      vertex: ProvencherPatternVertexShader,
      fragment: ProvencherPatternFragmentShader,
    },
  },
  preComponents: {
    trail: {
      combine: trailShader,
    },
  },
  components: {
    default: {
      vertex: defaultVertexShader,
      fragment: defaultFragmentShader,
    },
    simulation: {
      vertex: simulationVertexShader,
      fragment: simulationFragmentShader,
    },
    particles: {
      vertex: particlesVertexShader,
      fragment: particlesFragmentShader,
    },
  },
};

class ShadersManager {
  static get(category, name, type) {
    return Shaders[category][name][type];
  }
}

export default ShadersManager;
