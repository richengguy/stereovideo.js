/// <reference path='../opengl/opengl.ts' />

namespace svjs.app {

function IsStereoPair(object: any): object is StereoPair {
    return object.left !== undefined && object.right !== undefined;
}

// Interface documentation follows definitions.

export interface RenderingOptions {
    scale: number;
    bias: number;
}

export interface StereoPair {
    left: HTMLVideoElement;
    right: HTMLVideoElement;
}

export interface ImageWithDepth {
    image: HTMLVideoElement;
    depthmap: HTMLVideoElement;
}

/**
 * Control how a synthetic image is rendered.
 * @name RenderingOptions
 * @interface
 * @memberof svjs.app
 * @property scale {number}
 * @property bias {number}
 */

/**
 * Specify a left-right stereo image pair.
 * @name StereoPair
 * @interface
 * @memberof svjs.app
 * @property left {HTMLVideoElement} - `<video>` tag containing the left camera
 * @property right {HTMLVideoElement} - `<video>` tag containing the right
 *      camera
 */

/**
 * Specify an image along with a depth map (image+depth).
 * @name ImageWithDepth
 * @interface
 * @memberof svjs.app
 * @property image {HTMLVideoElement} - `<video>` tag containing the camera
 *      view
 * @property depthmap {HTMLVideoElement} - `<video>` tag containing the depth
 *      map for the provided camera view (assumed to be greyscale footage)
 */

/**
 * Available rendering modes supported by the stereovideo.js player.
 * @name RenderMode
 * @memberof svjs.app
 * @readonly
 * @enum
 * @property {number} Original - Display the original image or left view if
 *      given a stereo pair.
 * @property {number} DepthMap - Display the depth map or right view if given a
 *      stereo pair.
 * @property {number} Anaglyph -  Display the 3D output in anaglyph format.
 * @property {number} SideBySide - Display the 3D output in side-by-side format
 *      (suitable for 3DTVs).
 */
export enum RenderMode {
    Original,
    DepthMap,
    Anaglyph,
    SideBySide
}

// Used internally by the Renderer class.
enum ShaderID {
    PassThrough, // simply display the original image
    DBIR,        // generate a synthetic view given a depth map
    Anaglyph,    // render a stereo pair as a anaglyph (red-green) image
    SideBySide   // render a stereo pair in side-by-side mode
}

/**
 * Render a stereo image given an OpenGL context.
 * @memberof svjs.app
 */
export class Renderer {

    /**
     * @param {WebGLRenderingContext} gl - OpenGL rendering context
     * @param {svjs.opengl.Dimensions} size - rendering surface dimensions
     */
    public constructor(gl: opengl.GLContext, size: opengl.Dimensions) {
        this.gl_context_ = gl;
        this.surface_size_ = size;

        let context = this.gl_context_.getRenderingContext();

        // compile and link all shaders
        this.programs_ = [];
        this.programs_[ShaderID.PassThrough] =
            this.GenerateShader_('basic', 'basic');
        this.programs_[ShaderID.DBIR] =
            this.GenerateShader_('basic', 'dbir');
        this.programs_[ShaderID.Anaglyph] =
            this.GenerateShader_('basic', 'anaglyph');
        this.programs_[ShaderID.SideBySide] =
            this.GenerateShader_('basic', 'sidebyside');

        // create the display surface
        this.surface_ = new opengl.Surface(context);

        this.framebuffer_ = new opengl.Framebuffer(
            context, this.surface_size_.width, this.surface_size_.height);
        this.framebuffer_.slot = 1;

        this.textures_ = [];
        this.textures_[0] = new opengl.Texture(context, this.surface_size_);
        this.textures_[1] = new opengl.Texture(context, this.surface_size_);

        this.textures_[0].slot = 0;
        this.textures_[1].slot = 1;
    }

    /**
     * Request that a new frame be rendered given either a stereo image pair or
     * an image along with a depth map.  The rendering pipeline is updated
     * automatically depending on what is passed into this method.
     * @param images {(StereoPair|ImageWithDepth)} - the images that should be
     *      rendered by the player
     */
    public Render(images: StereoPair | ImageWithDepth) {
        let context = this.gl_context_.getRenderingContext();
        this.PrepareTextures_(images);

        // Check to see if a right view needs to be synthesized.
        if (!IsStereoPair(images)) {
            this.RenderSyntheticView_(images);
        }

        // Now just set the shaders depending on the mode.
        switch (this.render_mode_) {
            case RenderMode.Original:
                this.SetupPassThrough_(0);
                break;
            case RenderMode.DepthMap:
                this.SetupPassThrough_(1);
                break;
            case RenderMode.Anaglyph:
                this.SetupShader_(ShaderID.Anaglyph);
                break;
            case RenderMode.SideBySide:
                this.SetupShader_(ShaderID.SideBySide);
                break;
        }

        // Finally, render to the display surface.
        this.surface_.bind(context);
        this.surface_.drawSurface(context, this.vertex_attrib);
    }

    /**
     * Specify the DBIR (depth-based image rendering) settings used to generate
     * a synthetic stereo image path.  This has no effect when rendering an
     * existing stereo pair.
     * @member {svjs.app.RenderingOptions}
     */
    get DBIRSetting(): RenderingOptions {
        return this.dbir_opts_;
    }

    set DBIRSetting(setting: RenderingOptions) {
        this.dbir_opts_ = setting;
    }

    /**
     * Specify the current rendering mode.
     * @member {svjs.app.RenderMode}
     */
    get Mode(): RenderMode {
        return this.render_mode_;
    }

    set Mode(mode: RenderMode) {
        this.render_mode_ = mode;
    }

    // -- private methods -------------------------------------------------- //

    private GenerateShader_(vert: string, frag: string): opengl.GLSLProgram {
        console.log('-- generating shader -> ' + vert + ' + ' + frag);

        let library = opengl.ShaderLibrary.Instance();
        let context = this.gl_context_.getRenderingContext();

        let src_vert = library.GetShader(vert, opengl.ShaderType.Vertex);
        let src_frag = library.GetShader(frag, opengl.ShaderType.Fragment);

        let shader_vert = new opengl.GLSLShader(context, src_vert);
        let shader_frag = new opengl.GLSLShader(context, src_frag);

        return new opengl.GLSLProgram(context, shader_vert, shader_frag);
    }

    private PrepareTextures_(data: StereoPair | ImageWithDepth) {
        let context = this.gl_context_.getRenderingContext();

        if (IsStereoPair(data)) {
            // texture storing the left-camera images
            this.textures_[0].bindTexture(context);
            this.textures_[0].updateTexture(context, data.left);

            // texture storing the right-camera images
            this.textures_[1].bindTexture(context);
            this.textures_[1].updateTexture(context, data.right);
        } else {
            // texture storing the original camera image
            this.textures_[0].bindTexture(context);
            this.textures_[0].updateTexture(context, data.image);

            // texture storing the associated depth data
            this.textures_[1].bindTexture(context);
            this.textures_[1].updateTexture(context, data.depthmap);
        }
    }

    private SetupPassThrough_(texture_unit: number) {
        let context = this.gl_context_.getRenderingContext();

        let shader = this.programs_[ShaderID.PassThrough];
        shader.useProgram(context);
        shader.setUniform(context, 'texture', texture_unit);

        this.vertex_attrib = shader.getAttributeLocation(context,
                                                         'vertexPosition');
    }

    private SetupShader_(choice: ShaderID) {
        let context = this.gl_context_.getRenderingContext();

        let shader = this.programs_[choice];
        shader.useProgram(context);
        shader.setUniform(context, 'leftView', 0);
        shader.setUniform(context, 'rightView', 1);

        this.vertex_attrib = shader.getAttributeLocation(context,
                                                         'vertexPosition');
    }

    private NeedRenderSynthetic_(): boolean {
        return this.render_mode_ !== RenderMode.Original &&
               this.render_mode_ !== RenderMode.DepthMap;
    }

    private RenderSyntheticView_(data: ImageWithDepth) {
        if (!this.NeedRenderSynthetic_()) {
            return;
        }
        let context = this.gl_context_.getRenderingContext();

        // Adjust the DBIR parameters so that they are relative to the input
        // image size.
        const max_dim = Math.max(data.image.videoWidth, data.image.videoHeight);
        const scale = this.dbir_opts_.scale / max_dim;
        const bias = this.dbir_opts_.bias / max_dim;

        // Bind the FBO that will accept the rendered image.
        this.framebuffer_.bindFramebuffer(context);

        // Setup the shader.
        let dbir_shader = this.programs_[ShaderID.DBIR];

        dbir_shader.useProgram(context);
        dbir_shader.setUniform(context, 'leftView', 0);
        dbir_shader.setUniform(context, 'depthMap', 1);
        dbir_shader.setUniform(context, 'scale', scale);
        dbir_shader.setUniform(context, 'bias', bias);

        // Now render to the framebuffer.  At this point the synthesized view
        // is stored inside of the FBO and *not* displayed.
        const attrib = dbir_shader.getAttributeLocation(context,
                                                        'vertexPosition');
        this.surface_.bind(context);
        this.surface_.drawSurface(context, attrib);

        // Finally, unbind the FBO (don't need it anymore) and set up the FBO's
        // texture as the "right" camera view.
        this.framebuffer_.unbindFramebuffer(context);
        this.framebuffer_.useFBOTexture(context);
    }

    // -- private members -------------------------------------------------- //
    private gl_context_: opengl.GLContext;
    private surface_size_: opengl.Dimensions;
    private framebuffer_: opengl.Framebuffer;
    private programs_: opengl.GLSLProgram[];
    private surface_: opengl.Surface;
    private textures_: opengl.Texture[];
    private vertex_attrib: number;

    private render_mode_: RenderMode;
    private dbir_opts_: RenderingOptions;
}

} // namespace svjs::app
