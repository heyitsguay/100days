uniform float t;
uniform vec2 planeSize;
uniform float aspectRatio;
uniform vec2 mousePosition;

varying vec2 vUV;

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

//    vec2 vXY = -1. + 2. * vUV + planeSize;
//    vXY[1] *= aspectRatio;
//    vec2 position = floor(vXY * planeSize);

//    vec2 mouseXY = -1. + 2. * mousePosition + planeSize;
//    mouseXY[1] *= aspectRatio;
//    vec2 mouseFinalPosition = floor(mouseXY * planeSize);

    vec2 dPosition = vUV - mousePosition;

    // Lighting calculation
    float d2 = dot(dPosition, dPosition);
    float c = exp(1.5 + 3. * cos1(0.55 * t + 2. * sin1(0.45 * t)) );
    float v = 1. / (1. + c * d2);


    vec3 hsv = vec3(cos1(0.02 * t),
                    0.95,
                    0.25 + 0.75 * v);
	gl_FragColor = vec4(hsv2rgb(hsv), 1.0);
}
