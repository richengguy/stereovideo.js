/// <reference path='../opengl/types.ts' />
/// <reference path='../ui/dom.ts' />

namespace svjs.app {

function IsVideoFile(obj: any): obj is VideoFile {
    return obj.href !== undefined;
}

// VideoFile Interface (see below for documentation)
interface VideoFile {
    href: string;
    type?: string;
}

interface ReadyCallback {
    (): void;
}

interface ProgressCallback {
    (percent: number): void;
}

/**
 * Video source path and (optional) mimetype information.
 * @name VideoFile
 * @interface
 * @memberof svjs.app
 * @property {string} href - path to the source file
 * @property {string=} type - optional mimetype information
 */
/**
 * Simple wrapper around an HTML `<video>` tag that is not attached to the
 * page's DOM.  Instead it is meant to provide access to the underlying video
 * data video via a simple API.  It also conforms to the
 * {@link svjs.opengl.Dimensions} interface to allow it to be used when
 * creating textures of the appropriate size.
 * @memberof svjs.app
 * @implements svjs.opengl.Dimensions
 */
export class Video implements opengl.Dimensions {

    /**
     * The class can be instantiated with one or more source files.  The
     * browser will decide which source it should load first.
     * @param {string | svjs.app.VideoFile | svjs.app.VideoFile[]} src - one
     *      or more possible formats
     */
    public constructor(src: string | VideoFile | VideoFile[]) {
        this.element_ = ui.dom.Generate<HTMLVideoElement>('video');
        this.element_.Element.style.display = 'none';
        this.element_.Element.setAttribute('crossOrigin', 'anonymous');

        if (typeof src === 'string') {
            this.element_.Element.setAttribute('src', src);
        } else {
            // In both cases, just create a bunch of <source> tags for the
            // parent <video> tag.
            let sources: VideoFile[] = [];
            if (IsVideoFile(src)) {
                sources.push(src);
            } else {
                sources = src;
            }

            // Now attach them to the actual <video> tag.
            for (let elem of sources) {
                let tag = ui.dom.Generate<HTMLSourceElement>('source');
                tag.Element.setAttribute('src', elem.href);
                if (elem.type) {
                    tag.Element.setAttribute('type', elem.type);
                }
                this.element_.Attach(tag);
            }
        }
    }

    /**
     * Used to inform a listener that a particular video is ready to play.
     * @callback svjs.app.Video~ReadyCallback
     */

    /**
     * Used to inform a listener regarding how much of a particular video has
     * been downloaded.  The result is a value between 0 and 1.
     * @callback svjs.app.Video~ProgressCallback
     * @param {number} percent - download percentage (between 0 and 1)
     */

    /**
     * Specify the callbacks used to determine once a video has been loaded.
     * A "ready to play" callback must always be provided but a "download
     * progress" callback is also available.  These are wrappers around the
     * underlying `HTMLVideoElement` event handlers and are provided for
     * convenience.
     * @param {svjs.app.Video~ReadyCallback} ready - invoked once the video is
     *      ready to watch
     * @param {svjs.app.Video~ProgressCallback} progress - reports how much of
     *      the video has been loaded
     */
    public SetCallback(ready: ReadyCallback,
                       progress?: ProgressCallback): void {
        this.element_.Element.oncanplaythrough = ready;
        if (progress) {
            this.Tag.onprogress = (): void => {
                const ranges = this.Tag.buffered;

                // accumulate the range values
                let current = 0;
                for (let i = 0; i < ranges.length; i++) {
                    current += ranges.end(i) - ranges.start(i);
                }

                // compare them to the total media duration and invoke the
                // callback
                if (this.Tag.duration > 0) {
                    const percent = current / this.Tag.duration;
                    progress(percent);
                }
            };
        }
    }

    /**
     * Width of the video element.  The video must be loaded before this will
     * return any meaningful information.
     * @member {number}
     */
    get width(): number {
        return this.element_.Element.videoWidth;
    }

    /**
     * Height of the video element.  The video must be loaded before this will
     * return any meaningful information.
     * @member {number}
     */
    get height(): number {
        return this.element_.Element.videoHeight;
    }

    /**
     * A reference to the actual `<video>` tag.
     * @member {HTMLVideoElement}
     */
    get Tag(): HTMLVideoElement {
        return this.element_.Element;
    }

    // -- private members -------------------------------------------------- //
    private element_: ui.dom.Item<HTMLVideoElement>;
}

} // namespace svjs::app
