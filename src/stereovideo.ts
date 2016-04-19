/// <reference path='./app/player.ts' />
/// <reference path='./app/video.ts' />
/// <reference path='./options.ts' />

/**
 * Top-level interface to the StereoVideo player.  Each instance corresponds to
 * a single player that will be displayed inside of the browser.
 */
class StereoVideo {

    /**
     * @param {string} id - `id` attribute of the `<div>` element that will
     *      hold the player
     * @param {SVOptions} opts - player configuration options
     * @throws An exception if the provided ID does not refer to a `<div>`
     *      element or if no configuration options were provided.
     */
    public constructor(id: string, opts: SVOptions) {
        if (opts) {
            this.options_ = opts;
        } else {
            throw 'Failed to provide runtime options to StereoVideo.';
        }

        // initialize the player's UI
        const container = document.getElementById(id);
        if (container && container instanceof HTMLDivElement) {
            svjs.app.AppendDefaults(opts);
            this.player_ = new svjs.app.Player(container, opts);
        } else {
            throw 'StereoVideo requires that its container is a <div> element.';
        }

        // create the OpenGL context (require's the <canvas> from the UI)
        this.opengl_ = new svjs.opengl.GLContext(this.player_.DisplayCanvas);
        if (!this.opengl_.valid()) {
            throw 'StereoVideo failed to create the WebGL context.';
        }

        // setup the callbacks
        const dbir_types = {
            'image': svjs.app.RenderMode.Original,
            'depth': svjs.app.RenderMode.DepthMap,
            'anaglyph': svjs.app.RenderMode.Anaglyph,
            'side-by-side': svjs.app.RenderMode.SideBySide
        };
        this.player_.DisplayOptionSelected = (type: string) => {
            console.log('Display Type: ' + type);
            this.renderer_.Mode = dbir_types[type];
            this.Render_();
        };
        this.player_.RenderingOptionAdjusted = (scale: number,
                                                bias: number) => {
            console.log('DBIR Scale: ' + scale + ', Bias: ' + bias);
            this.renderer_.DBIRSetting = { scale: scale, bias: bias };
            this.Render_();
        };
        this.player_.PlayButtonClicked = () => {
            switch (this.player_.PlayerState) {
                case svjs.app.PlayerState.Paused:
                    this.Play();
                    break;
                case svjs.app.PlayerState.Playing:
                    this.Pause();
                    break;
                case svjs.app.PlayerState.Finished:
                    this.Reset();
                    break;
            }
        };

        // start loading the videos, setting up OpenGL once they are ready
        let video_ready = 0;
        const video_has_loaded = (): void => {
            ++video_ready;
            if (video_ready === 2) {
                this.SetupOpenGL_();
            }
        };

        this.video_ = { image: null, depth: null };
        this.video_.image = new svjs.app.Video(opts.video.image);
        this.video_.depth = new svjs.app.Video(opts.video.depth);

        this.video_.image.SetCallback(video_has_loaded);
        this.video_.depth.SetCallback(video_has_loaded);

        // link the playback of the left camera source to the depth map
        this.video_.image.Tag.addEventListener('play', () => {
            this.video_.depth.Tag.play();
        });
        this.video_.image.Tag.addEventListener('pause', () => {
            this.video_.depth.Tag.pause();
        });
        this.video_.image.Tag.addEventListener('seeked', () => {
            this.video_.depth.Tag.currentTime =
                this.video_.image.Tag.currentTime;
        });
        this.video_.image.Tag.addEventListener('ended', () => {
            this.player_.PlayerState = svjs.app.PlayerState.Finished;
            this.video_.depth.Tag.pause();
        });

        // force a render whenever the depth map has finished seeking
        this.video_.depth.Tag.onseeked = () => {
            this.Render_();
        };
    }

    /**
     * Start playing the loaded video.  This will have no effect until the
     * source files have finished loading or if the video is currently playing.
     */
    public Play(): void {
        this.player_.PlayerState = svjs.app.PlayerState.Playing;
        this.video_.image.Tag.play();
        this.timer_id_ = window.requestAnimationFrame((ts: number): void => {
            this.RenderLoop_(ts);
        });
    }

    /**
     * Pause the video playback.  This will have no effect unless the video is
     * currently playing.
     */
    public Pause(): void {
        this.player_.PlayerState = svjs.app.PlayerState.Paused;
        this.video_.image.Tag.pause();
        window.cancelAnimationFrame(this.timer_id_);
    }

    /**
     * Reset the player so that it goes back to the beginning of the source
     * video.
     */
    public Reset(): void {
        this.player_.PlayerState = svjs.app.PlayerState.Paused;
        this.video_.image.Tag.currentTime = 0;
    }

    // -- private members -------------------------------------------------- //

    private SetupOpenGL_(): void {
        const width = this.video_.image.width;
        const height = this.video_.image.height;

        console.log('Display Surface: ' + width + 'x' + height);

        this.player_.PlayerState = svjs.app.PlayerState.Paused;

        // resize the <canvas> to accomodate the video
        this.player_.DisplayCanvas.width = width;
        this.player_.DisplayCanvas.height = height;
        this.opengl_.setViewportSize(width, height);

        // create the renderer
        this.renderer_ = new svjs.app.Renderer(
            this.opengl_, { width: width, height: height });

        this.renderer_.Mode = svjs.app.RenderMode.Original;
        if (this.options_.display) {
            if (this.options_.display === 'image') {
                this.renderer_.Mode = svjs.app.RenderMode.Original;
            } else if (this.options_.display === 'depth') {
                this.renderer_.Mode = svjs.app.RenderMode.DepthMap;
            } else if (this.options_.display === 'anaglyph') {
                this.renderer_.Mode = svjs.app.RenderMode.Anaglyph;
            } else if (this.options_.display === 'side-by-side') {
                this.renderer_.Mode = svjs.app.RenderMode.SideBySide;
            }
        }

        this.renderer_.DBIRSetting = {
            scale: this.options_.scale.default,
            bias: this.options_.bias.default
        };
        this.Render_();
    }

    private Render_(): void {
        let frame: svjs.app.StereoPair | svjs.app.ImageWithDepth = null;
        if (this.options_.stereo) {
            frame = {
                left: this.video_.image.Tag,
                right: this.video_.depth.Tag
            };
        } else {
            frame = {
                image: this.video_.image.Tag,
                depthmap: this.video_.depth.Tag,
            };
        }
        this.renderer_.Render(frame);
    }

    private RenderLoop_(timestamp: number): void {
        this.Render_();
        if (!this.video_.image.Tag.paused) {
            this.timer_id_ = window.requestAnimationFrame((ts: number) => {
                this.RenderLoop_(ts);
            });
        }
    }

    private opengl_: svjs.opengl.GLContext;
    private options_: SVOptions;
    private player_: svjs.app.Player;
    private renderer_: svjs.app.Renderer;
    private timer_id_: number;
    private video_: { image: svjs.app.Video, depth: svjs.app.Video };
}
