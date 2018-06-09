precision highp float;
precision highp int;

uniform float aspectRatio;
uniform vec4 screenInfo;
uniform vec4 mouseInfo;
uniform vec4 constants;

uniform sampler2D field;

// Use a 3x3 diffusion stencil with these weights
const float w0 = 1. / 6.;
const float w1 = 1. / 12.;
const float w3 = 1.;

float d_line(vec2 x1, vec2 x2, vec2 p) {
    // Return the minimum distance between the line segment x1x2 and
    // the point p
    float L2 = dot(x1 - x2, x1 - x2);
    if (L2 == 0.0) { return distance(x1, p); }
    float t = max(0., min(1., dot(p - x1, x2 - x1) / L2));
    vec2 projection = x1 + t * (x2 - x1);
    return distance(projection, p);
}

void main() {
    // Unpack screen info
    vec2 screenSize = screenInfo.xy;
    vec2 screenInverse = screenInfo.zw;
    // Unpack mouse position
    vec2 mousePositionNow = mouseInfo.xy;
    vec2 mousePositionLast = mouseInfo.zw;
    // Unpack constants
    float cDiffuse = constants[0];
    float cDecay = constants[1];

    // [0, 1] normalized screen coordinates
    vec2 st = gl_FragCoord.xy * screenInverse;
    float ds = screenInverse[0];
    float dt = screenInverse[1];

    // Get texture info at this fragment's field position
    vec4 info = texture2D(field, st);
    // Velocity term packed into the last two components
    vec2 velocity = info.zw;

    // Use the velocity term to pick a target center location
    vec2 c = st - velocity;
    // Build up the stencil position offsets using these four vectors
    vec2 right = vec2(ds, 0.);
    vec2 up = vec2(0., dt);
    vec2 rightup = right + up;
    vec2 rightdown = right - up;
    // Stencil locations
    vec2 n = c + up;
    vec2 ne = c + rightup;
    vec2 e = c + right;
    vec2 se = c + rightdown;
    vec2 s = c - up;
    vec2 sw = c - rightup;
    vec2 w = c - right;
    vec2 nw = c - rightdown;

    // Get values at stencil locations
    vec2 vC = texture2D(field, c).rg;
    vec2 vN = texture2D(field, n).rg;
    vec2 vNE = texture2D(field, ne).rg;
    vec2 vE = texture2D(field, e).rg;
    vec2 vSE = texture2D(field, se).rg;
    vec2 vS = texture2D(field, s).rg;
    vec2 vSW = texture2D(field, sw).rg;
    vec2 vW = texture2D(field, w).rg;
    vec2 vNW = texture2D(field, nw).rg;

    // Normalized fragment position in [0,1]x[0,1]
    vec2 position = gl_FragCoord.xy * screenInverse;

    // Field value at this position
    float value = 0.996 * texture2D(field, position).r;

    vec2 dMouse = vec2(position[0], position[1] * aspectRatio) -
        vec2(attractorPosition[0], attractorPosition[1] * aspectRatio);

    float d = length(dMouse);

    float cSpeed = 1. + 200. * attractorSpeed;

    // Add around the mouse
    value +=  0.03 * cSpeed / (1. + 50. * d);
    value = min(1., value);


	gl_FragColor = vec4(value, 0., 0.0, 1.0);
}
