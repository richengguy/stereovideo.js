namespace svjs.opengl {

/**
 * The surface used to display the final rendered video.
 * @memberof svjs.opengl
 */
export class Surface {

    /**
     * Create a new Surface instance.
     * @param {WebGLRenderingContext} gl - application WebGL context
     */
    public constructor(gl: WebGLRenderingContext) {
        let verts = new Float32Array([
            1.0,  1.0,
           -1.0,  1.0,
            1.0, -1.0,
           -1.0, -1.0
        ]);
        this.surface_ = gl.createBuffer();
        this.bind(gl);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    }

    /**
     * Binds the surface to make it ready for use.
     * @param {WebGLRenderingContext} gl - application WebGL context
     */
    public bind(gl: WebGLRenderingContext) {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.surface_);
    }

    /**
     * Draw the surface.
     * @param {WebGLRenderingContext} gl - application WebGL context
     * @param {number} attr - vertex shader attribute ID that will refer to
     *      this particular surface
     */
    public drawSurface(gl: WebGLRenderingContext, attr: number) {
        gl.vertexAttribPointer(attr, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // -- private members --------------------------------------------------- //
    private surface_: WebGLBuffer;
}

} // namespace svjs::opengl
