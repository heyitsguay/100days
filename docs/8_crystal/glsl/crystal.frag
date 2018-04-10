precision highp float;
precision highp int;

uniform float t;
uniform vec2 ires;
uniform vec2 res;
uniform vec2 mousePosition;
uniform vec4 mouseAttributes;
uniform sampler2D data;

const float CDECAY = 0.999;
const float CDIFFUSE = 0.01667 * 14.;

const float THRESHOLD = 0.5;


void main() {

    vec2 xy = gl_FragCoord.xy * ires;
    float dx = ires[0];
    float dy = ires[1];

    float clicked = mouseAttributes[0];
    float radius = mouseAttributes[1];
    float strength = mouseAttributes[2];

    vec2 vUp = (0., dy);
    vec2 vDown = (0., -dy);
    vec2 vLeft = (-dx, 0.);
    vec2 vRight = (dx, 0.);

    vec4 up = texture2D(data, xy + vUp);
    vec4 down = texture2D(data, xy + vDown);
    vec4 left = texture2D(data, xy + vLeft);
    vec4 right = texture2D(data, xy + vRight);
    vec4 self = texture2D(data, xy);

    gl_FragColor = self;

    // Diffuse

    float underThreshold = float(self.r < THRESHOLD);
    float overThreshold = 1. - underThreshold;

    gl_FragColor.r += CDIFFUSE * (up.r + down.r + left.r + right.r
        - 4. * underThreshold * self.r);

    // Solid growth

    gl_FragColor.r += overThreshold * 0.05 * (1. - self.r);

    // Cursor contribution

    // TODO: Keep going here

    // Decay

    float decay = CDECAY * underThreshold + overThreshold;
    gl_FragColor.r *= decay;



}
