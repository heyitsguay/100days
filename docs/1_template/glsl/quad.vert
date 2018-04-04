uniform vec2 planeSize;
uniform float aspectRatio;

varying vec2 vUV;

void main() {
	vUV = -1. + 2. * uv + planeSize;
	vUV[1] *= aspectRatio;

    gl_Position = vec4(position, 1.);
}