/// <reference path='./types.ts' />

namespace svjs.opengl {

function IsImageElement(data: any): data is HTMLImageElement {
    return data instanceof HTMLImageElement;
}

function IsVideoElement(data: any): data is HTMLVideoElement {
    return data instanceof HTMLVideoElement;
}

/**
 * Representation of an OpenGL texture object.
 */
export class Texture {

    /**
     * Specify the size of a texture object.
     * @typedef {{width: number, height: number}} size
     */

    /**
     * @param {WebGLRenderingContext} gl - rendering context
     * @param {(HTMLImageElement|HTMLVideoElement|size)} data - an
     *      HTMLImageElement or HTMLVideoElement that contains the texture
     *      data
     */
    public constructor(gl: WebGLRenderingContext, data: HTMLImageElement);
    public constructor(gl: WebGLRenderingContext, data: HTMLVideoElement);
    public constructor(gl: WebGLRenderingContext, data: Dimensions);
    public constructor(gl: WebGLRenderingContext, data) {
        this.texture_ = gl.createTexture();

        this.slot_ = 0;
        let has_data = IsImageElement(data) || IsVideoElement(data);

        if (IsImageElement(data)) {
            this.width_ = data.width;
            this.height_ = data.height;
        } else if (IsVideoElement(data)) {
            this.width_ = data.videoWidth;
            this.height_ = data.videoHeight;
        } else if (IsDimensions(data)) {
            this.width_ = data.width;
            this.height_ = data.height;
        } else {
            throw new Error(
                'Data must be either an HTMLImageElement/HTMLVideoElement or ' +
                'something with width/height properties.');
        }

        // create texture
        gl.bindTexture(gl.TEXTURE_2D, this.texture_);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);

        if (has_data) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                          data);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width_, this.height_,
                          0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        }

        // set texture parameters
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        // unbind texture
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    /**
     * Binds the texture to the current OpenGL rendering context.
     * @param {WebGLRenderingContext} gl - rendering context
     */
    public bindTexture(gl: WebGLRenderingContext) {
        gl.activeTexture(gl.TEXTURE0 + this.slot_);
        gl.bindTexture(gl.TEXTURE_2D, this.texture_);
    }

    /**
     * Updates the contents of the texture.
     *
     * The new image must have the same dimensions as what the texture was
     * created with.  The texture must be set as active (bound to the
     * current OpenGL state) for the update to work.
     *
     * @param {WebGLRenderingContext} gl - rendering context
     * @param {any} data - image/video element to be rendered
     */
    public updateTexture(gl: WebGLRenderingContext,
                         data: HTMLImageElement | HTMLVideoElement) {
        if (IsVideoElement(data) || IsImageElement(data)) {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                             <any>data);
        } else {
            throw 'Data must be either an HTMLImageElement or ' +
                  'HTMLVideoElement.';
        }
    }

    /**
     * The texture unit (slot) that the texture will use when it's active.
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
    private texture_: WebGLTexture;
    private slot_: number;
    private width_: number;
    private height_: number;
}

} // namespace svjs::opengl
