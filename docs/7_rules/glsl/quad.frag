precision highp float;
precision highp int;

uniform float t;
uniform vec2 screenInverse;
uniform vec2 attractorPosition;
uniform vec2 mousePosition;
uniform float aspectRatio;
uniform float ticksSinceMotion;

uniform sampler2D data;

// Thanks to sam at http://lolengine.net/blog/2013/07/27/rgb-to-hsv-in-glsl (May 19, 2015).
const vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
// Convert a color vec3 in HSV coordinates to a color vec3 in RGB coordinates. Assumes all coordinate ranges are [0,1].
vec3 hsv2rgb(vec3 c) {
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    vec3 rgb = c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
    return rgb;
}

float cos1(float x) {
    return 0.5 * (cos(x) + 1.);
}

float sin1(float x) {
    return 0.5 * (sin(x) + 1.);
}

float mod1(float x) {
    return mod(mod(x, 1.) + 1., 1.);
}

float sig(float x, float c, float m) {
    return 1. / (1. + exp(-m * (x - c)));
}

void main() {
    float tt = 40. * (1. - cos(0.01745329251 * (t + 25.)));

    vec2 xy = gl_FragCoord.xy * screenInverse;

    vec4 sample = texture2D(data, xy);

    float f = sample.r;
    float ticksSinceChange = sample.g;
    float dAbs = sample.b;
    float rule = sample.a;

    float h = mod(mod(0.66 + cos(0.09 * t) - 0.2 * sin(dAbs * 0.05) * cos(0.02 * t) * sin(dot(xy * vec2(cos(0.3 * t), sin(0.3 * t)), xy)), 1.) + 1., 1.);
    float s = 0.75 * exp(-0.006 * ticksSinceChange);
    float v = min(1., 0.13 + 0.72 * f + 0.72 * exp(-0.012 * ticksSinceChange));
    vec3 hsv = vec3(h, s, v);
    vec3 rgb = hsv2rgb(hsv);

    gl_FragColor = vec4(rgb, 1.0);
//	gl_FragColor = vec4(0., 0., f, 1.0);
}
