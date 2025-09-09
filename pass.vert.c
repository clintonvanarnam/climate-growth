#ifdef GL_ES
precision mediump float;
precision mediump int;
#endif

attribute vec3 aPosition;
attribute vec2 aTexCoord;
varying vec2 vUv;

void main() {
  vUv = aTexCoord;
  gl_Position = vec4(aPosition, 1.0);
}