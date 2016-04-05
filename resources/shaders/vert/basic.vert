attribute vec2 vertexPosition;

varying vec2 texCoord;

void main(void) {
    texCoord = vertexPosition/2.0 + 0.5;
    gl_Position = vec4(vertexPosition, 0.0, 1.0);
}