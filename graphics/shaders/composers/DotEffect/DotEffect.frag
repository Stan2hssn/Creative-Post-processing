uniform float uTime;
uniform float uDotSize;
uniform float uTreshold;
uniform float uThirdTone;

uniform vec2 uResolution;

uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 normalizePixelSize = uDotSize / uResolution.xy;
    float rowIndex = floor(uv.x / normalizePixelSize.x);
    vec2 uvPixel = normalizePixelSize * floor(uv / normalizePixelSize);

    vec4 color = texture2D(tDiffuse, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

    vec2 cellUV = fract(uv / normalizePixelSize);

    float radius;
    if(luma > uTreshold) {
        radius = 0.3;
    } else if(uThirdTone > 0.0) {
        radius = (luma > 0.12) ? .12 : 0.075;
    } else {
        radius = 0.075;
    }

    vec2 circleCenter;
    if(luma > uTreshold) {

        circleCenter = vec2(0.5, .3);
    } else if(uThirdTone > 0.0) {
        circleCenter = (luma > 0.12) ? vec2(0.5, 0.12) : vec2(0.5, 0.);
    } else {
        circleCenter = vec2(0.5, 0.);
    }

    float distanceFromCenter = length(cellUV - circleCenter);

    float mask = smoothstep(radius, radius - 0.05, distanceFromCenter);

    color = vec4((uSecondaryColor + (mask - .5)) + uPrimaryColor, 1.0);

    gl_FragColor = color;

    #include <colorspace_fragment>
}