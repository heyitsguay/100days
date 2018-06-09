precision highp float;
precision highp int;

attribute vec3 position;
attribute vec3 uv;

varying vec2 v_uv;

void main() {

    v_uv = uv.xy;

    gl_Position = vec4(position, 1.);
}