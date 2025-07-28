#version 300 es
precision lowp float;

uniform mat3 u_transform;
uniform vec4 u_camera;
in vec2 v_position;
out vec2 vUV;

void main() {
  vUV = vec2(v_position.x, 1.0 - v_position.y);
  vec2 pos = (u_transform * vec3(v_position, 1.0)).xy - u_camera.xy;
  gl_Position = vec4(pos * u_camera.zw, 0.0, 1.0);
}