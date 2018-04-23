precision highp float;
precision highp int;

uniform float t;
uniform vec2 screenInverse;
uniform vec2 screenSize;
uniform vec2 mousePosition;
uniform vec4 mouseAttributes;
uniform float aspectRatio;

uniform sampler2D data;

const float CDECAY = 0.999;
const float CDIFFUSE = 0.01667 * 2.;

const float THRESHOLD = 0.5;

const float MINVAL = 1e-4;


void main() {

    vec2 xy = gl_FragCoord.xy * screenInverse;
    float dx = screenInverse[0];
    float dy = screenInverse[1];

    float clicked = mouseAttributes[0];
    float radius = mouseAttributes[1];
    float strength = mouseAttributes[2];

    vec2 vUp = vec2(0., dy);
    vec2 vDown = vec2(0., -dy);
    vec2 vLeft = vec2(-dx, 0.);
    vec2 vRight = vec2(dx, 0.);

    vec4 up = texture2D(data, xy + vUp);
    vec4 down = texture2D(data, xy + vDown);
    vec4 left = texture2D(data, xy + vLeft);
    vec4 right = texture2D(data, xy + vRight);
    vec4 self = texture2D(data, xy);

    gl_FragColor = self;

    float ticksSinceThreshold = self.g;

    float underThreshold = float(gl_FragColor.r < THRESHOLD);
    float overThreshold = 1. - underThreshold;

    // Diffuse

    gl_FragColor.r += CDIFFUSE * (up.r + down.r + left.r + right.r
        - 4. * underThreshold * self.r);

    // Solid growth

//    gl_FragColor.r += overThreshold * 0.005 * (1. - self.r);

    // Cursor contribution

    // Aspect ratio correction
    vec2 aspect = vec2(1., aspectRatio);

    vec2 xyFixed = xy * aspect;
    vec2 mouseFixed = mousePosition * aspect;

    gl_FragColor.r += clicked * strength *
        float(distance(xyFixed, mouseFixed) < radius);

    // Decay

    float overThresholdAtEnd = float(gl_FragColor.r >= THRESHOLD);
    float underThresholdAtEnd = 1. - overThresholdAtEnd;

    float decay = CDECAY * underThresholdAtEnd + overThresholdAtEnd;
    gl_FragColor.r *= decay;

    // Minimum value thresholding

    gl_FragColor.r *= float(gl_FragColor.r > MINVAL);

    gl_FragColor.r = max(0., min(1., gl_FragColor.r));

    // Update calculation of ticks since crossing the threshold

    gl_FragColor.g = overThresholdAtEnd * (gl_FragColor.g + 1.);

}
