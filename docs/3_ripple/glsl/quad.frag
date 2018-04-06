precision highp float;
precision highp int;

uniform float t;
uniform vec2 screenInverse;
uniform vec2 mousePositionNow;
uniform float aspectRatio;

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
    float tt = 1. * t;
    vec2 uv = gl_FragCoord.xy * screenInverse;
    uv[1] *= aspectRatio;
    float u = uv[0];
    float v = uv[1];

    float theta = 6.28318530718 * mod1(0.001 * tt);
    float ct = cos(theta);
    float st = sin(theta);

    float ur = ct * u + st * v;
    float vr = -st * u + ct * v;

    float uc = 0.75 + 0.25 * ur;
    float vc = 0.75 + 0.25 * vr;

    float ut = uc * tt;
    float vt = vc * tt;
    float rt = (uc * uc + vc * vc) * tt;

    float dh = sin(cos1(0.05 * rt) +
               0.3 * cos(0.25 * ut) *
                     sin(vt + 2. * cos(0.25 * ut)));

    float h = mod1(0.2 + 0.02 * tt + 0.3 * dh);

    float s = 0.33 + 0.53 * cos1(0.3 * tt);

    vec2 dMouse = uv - vec2(mousePositionNow[0],
                            mousePositionNow[1] * aspectRatio);
    float d2 = dot(dMouse, dMouse);

    float b = 0.1 + 0.85 / (1. + 7. * d2);


    vec3 hsv = vec3(h, s, b);
	gl_FragColor = vec4(hsv2rgb(hsv), 1.0);
}
