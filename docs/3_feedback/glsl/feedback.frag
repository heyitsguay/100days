/*feedback.frag

Simple texture feedback test, using my old ComputeRenderer.

*/
uniform vec2 screenInverse;
uniform vec2 mousePositionLast;
uniform vec2 mousePositionNow;
uniform float cDecay;

uniform sampler2D field;

// Based on `minimum_distance()` in https://stackoverflow.com/a/1501725
float min_distance2(vec2 x1, vec2 x2, vec2 p) {
    // Return the minimum distance between the line segment x1x2 and
    // the point p
    float L2 = dot(x1 - x2, x1 - x2);
    if (L2 == 0.0) { return distance(x1, p); }
    float t = max(0., min(1., dot(p - x1, x2 - x1) / L2));
    vec2 projection = x1 + t * (x2 - x1);
    vec2 d = projection - p;
    return dot(d, d);
}

void main() {
    // Normalized fragment position in [0,1]x[0,1]
    vec2 position = gl_FragCoord.xy * screenInverse;
    // Field value at this position
    float value = texture2D(field, position)[0];
    float newValue = value;

    // Smoothly draw along the line between the last and current mouse postions
    // Distance to line connecting positions
    float d2 = dot(mousePositionNow - position,
                   mousePositionNow - position);
//    float d2 = min_distance2(mousePositionLast,
//                            mousePositionNow,
//                            position);
    // Add around the mouse
    newValue += 0.01 / (1. + 1.* d2);

	gl_FragColor = vec4(newValue, 0.0, 0.0, 1.0);
}
