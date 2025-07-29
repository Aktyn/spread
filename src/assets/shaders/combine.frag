#version 300 es
precision lowp float;

uniform sampler2D u_background;
uniform sampler2D u_solid;
uniform sampler2D u_objects;
uniform vec2 u_viewport_scale;

in vec2 vUV;
out vec4 outColor;

#define PARALLAX_DIM_FACTOR 0.8
#define PARALLAX_SAMPLES 10
#define PARALLAX_LENGTH 0.125

#define SHADOW_FACTOR 0.25
#define SHADOW_VECTOR vec2(1.0, -1.0) * 0.075

vec4 bevel(in vec4 base, in sampler2D targetSampler, in vec2 parallax) {
  bool dim = false;

  lowp float STEP = 1.0 / float(PARALLAX_SAMPLES);
  for(int i=1; i<=PARALLAX_SAMPLES; i++) {
  // for(int i=PARALLAX_SAMPLES; i>0; i--) {
    lowp float factor = float(i) * STEP;

    vec4 beveledCurve = texture(targetSampler, vUV - parallax*factor);
    if(beveledCurve.a == 1.0) {
      base = beveledCurve;
    } 
    else if(base.a == 1.0) {
      dim = true;
    }
  }

  if(dim) {
    base.rgb *= PARALLAX_DIM_FACTOR;
  }
  return base;
}


void main() {
  vec4 solid = texture(u_solid, vUV);
  vec4 objects = texture(u_objects, vUV);

  vec2 pixelViewPosition = vUV * 2.0 - 1.0;
  vec2 parallax = u_viewport_scale * vec2(
    pow(abs(pixelViewPosition.x), 0.75) * sign(pixelViewPosition.x),
    pow(abs(pixelViewPosition.y), 0.75) * sign(pixelViewPosition.y)
  ) * PARALLAX_LENGTH;

  vec4 foreground = mix(bevel(solid, u_solid, parallax), objects, objects.a);
  vec3 background = texture(u_background, vUV).rgb;

  lowp float shadow = 1.0;
  vec2 shadowVector = u_viewport_scale * SHADOW_VECTOR;

  vec4 solidColor = texture(u_solid, vUV - shadowVector);
  vec4 objectsColor = texture(u_objects, vUV - shadowVector);
  if( solidColor.a > 0.0 || objectsColor.a > 0.0 ) {
    shadow -= max(solidColor.a, objectsColor.a) * SHADOW_FACTOR;
  }

  vec3 color = mix(background * shadow, foreground.rgb, foreground.a);
  
  outColor = vec4(color, 1.0);
} 