uniform float uTime;
uniform float uPixelSize;

uniform vec2 uResolution;

uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;

uniform sampler2D tDiffuse;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 normalizePixelSize = uPixelSize / uResolution.xy;
    float rowIndex = floor(uv.x / normalizePixelSize.x);
    vec2 uvPixel = normalizePixelSize * floor(uv / normalizePixelSize);

    vec4 color = texture2D(tDiffuse, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

    vec2 cellUV = fract(uv / normalizePixelSize);

    float lineWidth = 0.0;

    if(luma > 0.0) {
        lineWidth = 1.0;
    }

    if(luma > 0.3) {
        lineWidth = 0.7;
    }

    if(luma > 0.5) {
        lineWidth = 0.5;
    }

    if(luma > 0.7) {
        lineWidth = 0.3;
    }

    if(luma > 0.9) {
        lineWidth = 0.1;
    }

    if(luma > 0.99) {
        lineWidth = 0.0;
    }

    float yStart = 0.05;
    float yEnd = 0.95;

    if(cellUV.y > yStart && cellUV.y < yEnd && cellUV.x > 0.0 && cellUV.x < lineWidth) {
        color = vec4(uPrimaryColor, 1.0);
    } else {
        color = vec4(uSecondaryColor, 1.0);
    }

    gl_FragColor = color;

    #include <colorspace_fragment>
}