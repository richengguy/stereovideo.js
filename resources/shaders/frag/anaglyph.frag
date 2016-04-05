precision mediump float;

uniform sampler2D leftView;
uniform sampler2D rightView;

varying vec2 texCoord;

void main(void) {
    vec4 left  = texture2D(leftView, texCoord);
    vec4 right = texture2D(rightView, texCoord);

    float grey = 0.2989*left.r + 0.587*left.g + 0.114*left.b;

    gl_FragColor = vec4(grey, right.g, right.b, 1.0);
}