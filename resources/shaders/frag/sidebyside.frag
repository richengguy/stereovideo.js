precision mediump float;

uniform sampler2D leftView;
uniform sampler2D rightView;

varying vec2 texCoord;

void main(void) {
    vec2 leftCoord = texCoord*vec2(2.0, 1.0);
    vec2 rightCoord = texCoord*vec2(2.0, 1.0) - vec2(1.0, 0.0);

    vec4 left  = texture2D(leftView, leftCoord);
    vec4 right = texture2D(rightView, rightCoord);

    gl_FragColor = (texCoord.x < 0.5) ? left : right;
}