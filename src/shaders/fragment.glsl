#version 300 es
precision highp float;

in vec2 v_uv;
uniform float u_time;
uniform vec2 u_resolution;
out vec4 outColor;

void main() {
  vec2 p = (v_uv * 2.0 - 1.0) * (u_resolution / min(u_resolution.x, u_resolution.y));
  float t = u_time * 0.125 + .5;
  p.y -= t;
  p.x += 0.001 * sin(p.y * 250.0);
  float a = 0.0;
  float b = t;
  for (float i = 0.0; i < 5.0; i++) {
    a += cos(i - a * p.x - b * 1.25);
    b += cos(i * p.y + a * 1.25);
  }
  b -= t;
  float r = sin(cos(a - b) * 0.2) + 0.1;
  r += r * r + 0.005 * sin(p.y * 500.0);
  outColor = vec4(r, r * 0.08, r * 0.02, 1.0);
}
