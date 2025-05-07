uniform float uTime;
uniform float uPatternSize;

uniform vec2 uResolution;

uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;

uniform sampler2D tDiffuse;

varying vec2 vUv;

vec2 scaleUv(in vec2 uv, in float scale) {
    vec2 center = vec2(0.5, 0.5);
    uv -= center;
    uv *= scale;
    uv += center;
    return uv;
}

void main() {
    vec2 uv = scaleUv(vUv, 1.);
    vec2 normalizePixelSize = uPatternSize / uResolution.xy;
    float rowIndex = floor(uv.x / normalizePixelSize.x);
    vec2 uvPixel = normalizePixelSize * floor(uv / normalizePixelSize);

    vec4 color = texture2D(tDiffuse, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

    vec2 cellUV = fract(uv / normalizePixelSize);

    float distanceToCenter = length(cellUV - vec2(0.5, 0.5));

    if(luma > 0.4) {
        distanceToCenter = length(cellUV - vec2(0.5, 0.5)) * 1.7;
    } else if(luma > 0.1) {
        distanceToCenter = 1. - distanceToCenter * 1.7;

    } else if(luma > 0.01) {
        distanceToCenter = 0.;
    } else {
        distanceToCenter = 1.0;
    }

    float d = smoothstep(0.5, .51, distanceToCenter);

    color = vec4(vec3(d) + uPrimaryColor, 1.0);

    gl_FragColor = color;

    #include <colorspace_fragment>
}