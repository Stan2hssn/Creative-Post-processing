uniform float uTime;
uniform float uCharSize;
uniform float uCharCount;
uniform bool showBackground;

uniform vec2 uResolution;

uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;

uniform sampler2D tDiffuse;
uniform sampler2D tASCII;

varying vec2 vUv;

void main() {
    vec2 uv = vUv;
    vec2 normalizePixelSize = uCharSize / uResolution.xy;
    float rowIndex = floor(uv.x / normalizePixelSize.x);
    vec2 uvPixel = normalizePixelSize * floor(uv / normalizePixelSize);

    vec4 color = texture2D(tDiffuse, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

    vec2 cellUV = fract(uv / normalizePixelSize);

    float charIndex = clamp(floor(luma * (uCharCount - 1.0)), 0.0, uCharCount - 1.0);

    vec2 asciiUV = vec2((charIndex + cellUV.x) / uCharCount, cellUV.y);

    float character = texture2D(tASCII, asciiUV).r;

    vec3 backgroundColor = uPrimaryColor;
    if(showBackground) {
        backgroundColor = color.rgb;
    }

    vec3 foregroundColor = uPrimaryColor;

    color = vec4(character * uSecondaryColor * (luma + 0.01) + backgroundColor, 1.0);

    gl_FragColor = color;

    #include <colorspace_fragment>
}