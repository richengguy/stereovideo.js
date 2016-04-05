interface SVOptionsRange {
    min: number;
    max: number;
    default?: number;
}

interface SVOptionsVideo {
    href: string;
    type: string;
}

interface SVOptionsInput {
    image: string | SVOptionsVideo;
    depth: string | SVOptionsVideo;
}

interface SVConfig {
    bias?: SVOptionsRange;
    scale?: SVOptionsRange;
    display?: 'image' | 'depth' | 'anaglyph' | 'side-by-side';
    stereo?: boolean;
}

interface SVOptions extends SVConfig {
    video: SVOptionsInput;
}

/**
 * This is the top-most namespace for all of the various components in the
 * stereovideo.js player.
 *
 * @namespace svjs
 */
namespace svjs {

/**
 * Verify that the particular object implements the {@link SVOptionsRange}
 * interface.
 * @memberof svjs
 * @param obj {any} - object being tested
 * @return {boolean}
 */
export function ValidSVOptionsRange(obj: any): obj is SVOptionsRange {
    let has_min = obj.min && (typeof obj.min) === 'number';
    let has_max = obj.max && (typeof obj.max) === 'number';
    return has_min && has_max;
}

/**
 * Verify that the particular object implements the {@link SVOptionsVideo}
 * interface.
 * @memberof svjs
 * @param obj {any} - object being tested
 * @return {boolean}
 */
export function ValidSVOptionsVideo(obj: any): obj is SVOptionsVideo {
    return obj.href !== undefined && obj.type !== undefined;
}

/**
 * Verify that the particular object implements the {@link SVOptionsInput}
 * interface.
 * @memberof svjs
 * @param obj {any} - object being tested
 * @return {boolean}
 */
export function ValidSVOptionsInput(obj: any): obj is SVOptionsInput {
    let has_image = obj.image && ((typeof obj.image) === 'string' ||
                                  ValidSVOptionsVideo(obj));
    let has_depth = obj.depth && ((typeof obj.depth) === 'string' ||
                                  ValidSVOptionsVideo(obj));
    return has_image && has_depth;
}

} // namespace svjs

/**
 * Any option type that can vary between some minimum and maximum value.
 *
 * @name SVOptionsRange
 * @interface
 * @property {number} min - minimum value in the range
 * @property {number} max - maximum value in the range
 * @property {number} default - range's default value
 */

/**
 * Allow the input video files to be specified along with their associated
 * MIME type.
 *
 * @name SVOptionsVideo
 * @interface
 * @property {string} href - path to video file
 * @property {string} type - MIME type
 */

/**
 * The player requires two video files: a source video and a depth map video.
 * The source video is always treated as the left camera in a stereo pair.  The
 * depth map may be considered to be the right camera if the `SVOptions.stereo`
 * property is set to `true`.
 *
 * @name SVOptionsInput
 * @interface
 * @property {string | SVOptionsVideo} image - source video or left camera
 * @property {string | SVOptionsVideo} depth - depth map or right camera
 */

/**
 * The {@link SVOptions} interface provides the configuration options that are
 * accepted by a {@link StereoVideo} player object.
 *
 * @name SVOptions
 * @interface
 * @property {SVOptionsInput} video - video files that the player will play
 * @property {SVOptionsRange=} bias - range of acceptable DBIR bias values
 * @property {SVOptionsRange=} scale - range of acceptable DBIR scaling values
 * @property {string=} display - specify what type of display the player should
 *      show when it is first created; this must be one of the following:
 *      `image`, `depth`, `anaglyph` or `side-by-side`
 * @property {boolean=} stereo - if `true` then the depth map is actually the
 *      right camera in a stereo pair (enable/disables the DBIR stage)
 */
