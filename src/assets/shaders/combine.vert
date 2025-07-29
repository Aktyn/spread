#version 300 es
precision lowp float;

in vec2 v_position;
out vec2 vUV;

void main() {
  vUV = vec2(v_position.x, v_position.y);
  gl_Position = vec4(v_position * 2.0 - 1.0, 0.0, 1.0);
} 