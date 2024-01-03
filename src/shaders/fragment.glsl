
uniform float progress;
uniform float time;
uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec3 position;
float PI = 3.141592653589793238;


void main() {
  vec4 t = texture2D(uTexture1, vUv);
  vec4 t1 = texture2D(uTexture2, vUv);
  float sweep = step( vUv.y, progress);

  vec4 finalTexture = mix(t, t1, sweep);






  // gl_FragColor = t * progress;
  gl_FragColor = finalTexture;
}