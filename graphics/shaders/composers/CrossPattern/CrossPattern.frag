uniform float uTime;
uniform float uCrossSize;

uniform vec2 uResolution;

uniform vec3 uPrimaryColor;
uniform vec3 uSecondaryColor;

uniform sampler2D tDiffuse;

varying vec2 vUv;

float sdBlobbyCross(in vec2 pos, float he) {
    pos = abs(pos);
    pos = vec2(abs(pos.x - pos.y), 1.0 - pos.x - pos.y) / sqrt(2.0);

    float p = (he - pos.y - 0.25 / he) / (6.0 * he);
    float q = pos.x / (he * he * 16.0);
    float h = q * q - p * p * p;

    float x;
    if(h > 0.0) {
        float r = sqrt(h);
        x = pow(q + r, 1.0 / 3.0) - pow(abs(q - r), 1.0 / 3.0) * sign(r - q);
    } else {
        float r = sqrt(p);
        x = 2.0 * r * cos(acos(q / (p * r)) / 3.0);
    }
    x = min(x, sqrt(2.0) / 2.0);

    vec2 z = vec2(x, he * (1.0 - 2.0 * x * x)) - pos;
    return length(z) * sign(z.y);
}

vec2 scaleUv(in vec2 uv, in float scale) {
    vec2 center = vec2(0.5, 0.5);
    uv -= center;
    uv *= scale;
    uv += center;
    return uv;
}

void main() {
    vec2 uv = scaleUv(vUv, 1.);
    vec2 normalizePixelSize = uCrossSize / uResolution.xy;
    float rowIndex = floor(uv.x / normalizePixelSize.x);
    vec2 uvPixel = normalizePixelSize * floor(uv / normalizePixelSize);

    vec4 color = texture2D(tDiffuse, uvPixel);

    float luma = dot(vec3(0.2126, 0.7152, 0.0722), color.rgb);

    vec2 cellUV = fract(uv / normalizePixelSize);

    float mask = smoothstep(0.5, .51, sdBlobbyCross(scaleUv(cellUV, 7.), -3.));

    if(luma > 0.3) {
        color = vec4(vec3(1.) * mask + uPrimaryColor, 1.0);
    } else if(luma > 0.01) {
        color = vec4(vec3(1.) * mask + uSecondaryColor, 1.0);
    } else {
        color = vec4(vec3(1.), 1.0);
    }

    gl_FragColor = color;

    #include <colorspace_fragment>
}