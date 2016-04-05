precision mediump float;

uniform float scale;
uniform float bias;

uniform sampler2D leftView;
uniform sampler2D depthMap;

varying vec2 texCoord;

void main(void) {
    vec4 depth = texture2D(depthMap, texCoord);
    vec2 offset = vec2(scale*depth.r + bias, 0);

    gl_FragColor = texture2D(leftView, texCoord + offset);
}