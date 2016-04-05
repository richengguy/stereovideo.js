/// <reference path='./types.ts' />

namespace svjs.opengl {

/**
 * Manages an OpenGL framebuffer and its associated texture.
 * @memberof svjs.opengl
 */
export class Framebuffer {

    /**
     * Constructs a new OpenGL framebuffer.
     * @param {WebGLRenderingContext} gl - rendering context
     * @param {number} width - width of the framebuffer
     * @param {number} height - height of the framebuffer
     */
    public constructor(gl: WebGLRenderingContext, width: number,
                       height: number) {
        this.slot_ = 0;

        this.texture_ = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture_);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA,
                      gl.UNSIGNED_BYTE, null);

        this.fb_ = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb_);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                gl.TEXTURE_2D, this.texture_, 0);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Binds the FBO to the rendering context to the result is rendered there.
     * @param {WebGLRenderingContext} gl - rendering context
     */
    public bindFramebuffer(gl: WebGLRenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fb_);
    }

    /**
     * Restores rendering back onto the main display surface.
     * @param {WebGLRenderingContext} gl - rendering context
     */
    public unbindFramebuffer(gl: WebGLRenderingContext) {
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /**
     * Bind's the FBO's texture to the current rendering state.
     * @param {WebGLRenderingContext} gl - rendering context
     */
    public useFBOTexture(gl: WebGLRenderingContext) {
        gl.activeTexture(gl.TEXTURE0 + this.slot_);
        gl.bindTexture(gl.TEXTURE_2D, this.texture_);
    }

    /**
     * The slot (texture unit) that the FBO's texture will be bound to.
     * @member {number}
     */
    get slot(): number {
        return this.slot_;
    }

    set slot(slot: number) {
        if (slot >= 0 && slot < 32) {
            this.slot_ = slot;
        }
    }

    // -- private members -------------------------------------------------- //
    private fb_: WebGLFramebuffer;
    private texture_: WebGLTexture;
    private slot_: number;
}

} // namespace svjs::opengl
