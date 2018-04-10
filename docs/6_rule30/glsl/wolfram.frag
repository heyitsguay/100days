precision highp float;
precision highp int;

uniform float t;
uniform vec2 screenInverse;
uniform vec2 screenSize;
uniform sampler2D data;



float rand(vec3 co){
    return fract(sin(dot(co, vec3(12.9898, 78.233, 45.156))) * 63758.5453);
}



void main() {

    vec2 xy = gl_FragCoord.xy * screenInverse;
    float dx = screenInverse[0];
    float dy = screenInverse[1];

    bool left = bool(texture2D(data, xy + vec2(-dx, dy)).r);
    bool center = bool(texture2D(data, xy + vec2(0., dy)).r);
    bool right = bool(texture2D(data, xy + vec2(dx, dy)).r);
    float self = texture2D(data, xy).r;

    float ticksSinceChange = texture2D(data, xy).g;

    bool state = left ^^ (center || right);

    float r1 = rand(vec3(100. * xy, t));
    float r2 = rand(vec3(100. * xy + vec2(-12., 8.), t));
    float r3 = rand(vec3(100. * xy - vec2(0.184, 84.), t + 1.8));

    bool gate1 = r1 < 1e-4;
    bool gate2 = r2 < 0.54 && r2 > 0.54 - 1e-3;;
    bool gate3 = t > 10.;

    float condition = float(gate1 && gate2 && gate3);

    float randState = float(!state) * condition
        + float(state) * (1. - condition);

    float halfx = 0.5 * screenSize[0] * dx;

    float absx = abs(xy[0] - halfx) * screenSize[0];
    float absy = (1. - dy - xy[1]) * screenSize[1];
    float freezeMask = float(screenSize[1] - gl_FragCoord.y < 1.);
    float finalState = randState * (1. - freezeMask)
        + self * freezeMask;

    ticksSinceChange =
        (ticksSinceChange + 1.) * float(abs(self - finalState) < 0.1);

    float dAbs = length(vec2(absx, absy));

	gl_FragColor = vec4(finalState, ticksSinceChange, dAbs, 1.0);
}
