#version 300 es
precision lowp float;

uniform sampler2D u_texture;
in vec2 vUV;
out vec4 outColor;

void main() {
  outColor = texture(u_texture, vUV);
}