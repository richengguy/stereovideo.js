namespace svjs.opengl {

/**
 * Manages an OpenGL context.
 * @memberof svjs.opengl
 */
export class GLContext {

    /**
     * Creates a new OpenGL (WebGL) context from the provided canvas element.
     * @param {HTMLCanvasElement} canvas - rendering surface
     */
    constructor(canvas: HTMLCanvasElement) {
        this.ctx_ = null;
        try {
            let context = canvas.getContext('webgl') ||
                          canvas.getContext('experimental-webgl');
            this.ctx_ = <WebGLRenderingContext>context;
            this.is_valid_ = true;
            this.ctx_.clearColor(0, 0, 0, 1);
        } catch (e) {
            // does nothing
        }
    }

    /**
     * Clears the display buffer (basically zeros it).
     */
    public clearDisplay() {
        this.ctx_.clear(this.ctx_.COLOR_BUFFER_BIT);
    }

    /**
     * Set the size of the viewport to map OpenGL coords to window coords.
     * @param {number} width - width of the window in pixels
     * @param {number} height - height of the window in pixels
     */
    public setViewportSize(width: number, height: number) {
        this.ctx_.viewport(0, 0, width, height);
    }

    /**
     * Indicates if the rendering surface was created correctly.
     * @return {boolean}
     */
    public valid(): boolean {
        return this.is_valid_;
    }

    /**
     * Returns the rendering context (null if invalid).
     * @return {WebGLRenderingContext}
     */
    public getRenderingContext(): WebGLRenderingContext {
        return this.ctx_;
    }

    // -- private members -------------------------------------------------- //
    private is_valid_: boolean = false;
    private ctx_: WebGLRenderingContext;
}

} // namespace svjs::opengl
