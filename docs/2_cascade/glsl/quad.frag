uniform float t;
uniform vec2 screenInverse;
uniform sampler2D texture;

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

    float h = mod1(cos1(0.01 * t) +
              0.15 * cos1(0.15 * t) * sin1(t + 2. * cos1(0.15 * t)));

    vec2 st = gl_FragCoord.xy * screenInverse;
    float v = 0.25 + 0.75 * texture2D(texture, st).r;
//    float v = 1.;

    vec3 hsv = vec3(h,
                    0.95,
                    v);
	gl_FragColor = vec4(hsv2rgb(hsv), 1.0);
}
