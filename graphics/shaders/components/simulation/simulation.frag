// morph_sim_optimized.glsl – figure‑8 ⇄ donut particle simulation
// -----------------------------------------------------------------
// The main cost reduction tricks are:
// 1. Early mask computation (figureMask / donutMask) to avoid evaluating
//    branches that are inactive for the current morph value.
// 2. Replace expensive pow(x,2) with x*x, reuse sin/cos pairs, collapse
//    multiple trig evaluations, and pre‑scale constants.
// 3. Keep jitter / noise optional and lighter.
// 4. GLSL ES 3 syntax so we can use texture() without #extension hacks.

precision highp float;

uniform sampler2D uData;
uniform sampler2D uInfo;

uniform float uTime;
uniform float uMorph;
uniform vec2 uMouse;

in vec2 vUv;
out vec4 fragColor;

#define PI 3.141592653589793

// cheap hash → [0,1)
float rand(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

// ------- simplex‑noise helpers (unchanged, put in a shared include) ---------
#ifndef SIMPLEX_IMPL
#define SIMPLEX_IMPL
vec3 mod289(vec3 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 mod289(vec4 x) {
    return x - floor(x * (1.0 / 289.0)) * 289.0;
}
vec4 permute(vec4 x) {
    return mod289(((x * 34.0) + 1.0) * x);
}
vec4 taylorInvSqrt(vec4 r) {
    return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 0.142857142857; // 1/7
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
vec3 snoiseVec3(vec3 x) {
    float s = snoise(x);
    float s1 = snoise(vec3(x.y - 19.1, x.z + 33.4, x.x + 47.2));
    float s2 = snoise(vec3(x.z + 74.2, x.x - 124.5, x.y + 99.4));
    return vec3(s, s1, s2);
}
#endif
// ---------------------------------------------------------------------------

void main() {
    vec3 pos = texture(uData, vUv).xyz;
    vec3 info = texture(uInfo, vUv).xyz;

    // binary masks → cheaper than branching on floats
    float mFigure = 1.0 - step(0.9, uMorph); // >0 when figure‑8 visible
    float mDonut = step(0.1, uMorph);       // >0 when donut visible

    vec3 noise = snoiseVec3(pos * mix(0.25, 5., uMorph) + vec3(0.0, 0.0, uTime * 1e-4));

    // -------------- figure‑8 --------------
    vec3 figPos = pos;
    if(mFigure > 0.0) {
        float s = clamp(pos.z * 2.0, -1.0, 1.0);
        float sinSq = s * s * 0.25;               // ≈ (sin a)^2
        float c = clamp(pos.x * (1.0 + 4.0 * sinSq), -1.0, 1.0);
        float a = atan(s, c) + 0.2;           // advance param
        a = mod(a, PI * 2.0);
        float sa = sin(a), ca = cos(a);
        float d = 1.0 + sa * sa;               // denominator
        vec3 center = vec3(ca / d, (ca * sa) / d, 0.5 * sa);

        figPos = mix(pos, center, 0.22);

        // Keep exact same random pattern as original
        float r1 = rand(vUv * 123.45) - 0.25, r2 = rand(vUv * 678.90) + 0.25, r3 = rand(vUv * 999.99) - 0.5;

        float angle = r1 * 2.0 * PI * rand(vUv * 111.11);
        float radius = 0.02 * r2;  // Increased from 0.03 to 0.3 for more spread

        float x = cos(angle) * radius;
        float y = sin(angle) * radius;
        float z = r3 * 0.02;

        figPos += vec3(x, y, z);

        figPos -= noise * 0.01;
    }

    // ---------------- donut ---------------
    vec3 donPos = pos;
    if(mDonut > 0.0) {
        float r = length(pos.xy) * 0.8;
        float cent = 1.0 - smoothstep(0.5, 0.51, abs(info.x - r));
        float ang = atan(pos.y, pos.x) - info.y * 0.3 * mix(0.5, 1.0, cent);
        float targetR = mix(info.x, 1.5, 0.6 + 0.5 * sin(ang * 2.0 + uTime * 0.001 + PI));
        r += (targetR - r) * 0.1;
        donPos.xy += (vec2(cos(ang), sin(ang)) * r * 1.1 - pos.xy) * 0.1;
        donPos += noise * 0.003;
        donPos.z = 0.0;
    }

    // mix result
    pos = mix(figPos, donPos, uMorph);

    vec3 mouseXY = vec3(uMouse, 0.0);
    vec3 posXY = vec3(pos.xy, 0.0);
    float dist = length(posXY - mouseXY);
    vec3 dir = normalize(posXY - mouseXY);

    pos += dir * (1.0 - smoothstep(0.0, 1.0, dist)) * clamp(1.0 - uMorph, 0.015, 0.05);

    fragColor = vec4(pos, 1.0);
}