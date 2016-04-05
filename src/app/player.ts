/// <reference path='./internal/controlbar.ts' />
/// <reference path='./internal/optionspopup.ts' />
/// <reference path='../options.ts' />
/// <reference path='../ui/ui.ts' />

namespace svjs.app {

/**
 * The default player options.  See {@link SVOptions} for a description of the
 * various members.
 * @memberof svjs.app
 */
export const kDefaultOptions: SVConfig = {
    scale: {
        min: 1,
        max: 20,
        default: 1
    },
    bias: {
        min: -20,
        max: 20,
        default: 0
    },
    stereo: false
};

/**
 * Updates the configuration by checking to see if a property is present and,
 * if not, adding the default value.
 * @memberof svjs.app
 * @param {SVConfig} conf - configuration object being update (occurs in-place)
 */
export function AppendDefaults(conf: SVConfig): void {
    let range_defaults = (key: string): void => {
        let obj = conf[key];
        if (obj) {
            if (ValidSVOptionsRange(obj)) {
                if (!obj.default) {
                    obj.default = kDefaultOptions[key].default;
                }
            } else {
                if ((obj.min && !obj.max) || (!obj.min && obj.max)) {
                    throw 'Cannot specify a minimum range value without a ' +
                          'maximum and vice-versa.';
                }
                obj.min = kDefaultOptions[key].min;
                obj.max = kDefaultOptions[key].max;
                obj.default = obj.default || kDefaultOptions[key].default;
            }
        } else {
            conf[key] = kDefaultOptions[key];
        }
    };

    range_defaults('scale');
    range_defaults('bias');
}

/**
 * The set of states that the player could be in during its lifetime.
 *
 * @name PlayerState
 * @enum
 * @readonly
 * @memberof svjs.app
 * @property {number} Loading - player is waiting for video's to finish loading
 * @property {number} Pause - player is paused
 * @property {number} Playing - player is currently playing the video
 * @property {number} Finished - player has finished playing the media
 */
export enum PlayerState {
    Loading,
    Paused,
    Playing,
    Finished
}

/**
 * The {@link svjs.app.Player} provides the necessary UI to actually play the
 * video.  It does not manage the media.  Rather, it manages the `<canvas>`
 * display element and surrounding chrome.
 * @memberof svjs.app
 */
export class Player {

    /**
     * If no options are provided then the default application options will be
     * used.  These values are stored in {@link svjs.app.kDefaultOptions}.
     * @param {HTMLDivElement} container - the `<div>` tag that will contain
     *      the player
     * @param {SVOptions=} opts - player runtime options
     */
    public constructor(container: HTMLDivElement, opts: SVConfig) {
        this.container_ = new ui.dom.Item(container);
        this.container_.AddClass('svjs-container');

        this.state_ = PlayerState.Loading;
        this.InitElements_(opts);
        this.AssembleUI_();
    }

    /**
     * Controls how the player appears depending on what the video may be doing.
     * @member {svjs.app.PlayerState}
     */
    get PlayerState(): PlayerState {
        return this.state_;
    }

    set PlayerState(state: PlayerState) {
        switch (state) {
            case PlayerState.Loading:
                break;
            case PlayerState.Paused:
                this.controls_.button_play.Icon = 'icon-play';
                break;
            case PlayerState.Playing:
                this.controls_.button_play.Icon = 'icon-pause';
                break;
            case PlayerState.Finished:
                this.controls_.button_play.Icon = 'icon-replay';
                break;
        }
        this.state_ = state;
    }

    /**
     * @callback svjs.app.Player~AdjustCallback
     * @param {number} scale - scaling factor
     * @param {number} bias - bias amount
     */
    /**
     * Callback invoked whenever the DBIR options have been modified.  The
     * callback function will be invoked with the updated values.
     *
     * This value is "write-only".
     * @member {svjs.app.Player~AdjustCallback}
     */
    set RenderingOptionAdjusted(cb: (scale: number, bias: number) => void) {
        this.options_panel_.dbir_menu.SetCallback(cb);
    }

    /**
     * @callback svjs.app.Player~TypeCallback
     * @param {string} type - string containing the display option type
     */
    /**
     * Callback invoked whenever the display type (e.g. "normal", "anaglyph",
     * etc.) is changed.  The callback will return a string containing the
     * display option as a string.
     *
     * This value is "write-only".
     * @member {svjs.app.Player~TypeCallback}
     */
    set DisplayOptionSelected(cb: (type: string) => void) {
        this.options_panel_.view_menu.SetCallback(cb);
    }

    /**
     * @callback svjs.app.Player~ButtonCallback
     */
    /**
     * Callback invoked when the control bar's "play" button is clicked.  The
     * callback function takes no arguments.
     *
     * This value is "write-only".
     * @member {svjs.app.Player~ButtonCallback}
     */
    set PlayButtonClicked(cb: () => void) {
        this.controls_.button_play.SetCallback(() => {
            if (this.controls_.button_play.Icon === 'icon-play') {
                this.controls_.button_play.Icon = 'icon-pause';
            } else {
                this.controls_.button_play.Icon = 'icon-play';
            }
            cb();
        });
    }

    /**
     * The `<canvas>` used to display the output video.
     * @member {HTMLCanvasElement}
     * @readonly
     */
    get DisplayCanvas(): HTMLCanvasElement {
        return this.canvas_.Element;
    }

    // -- private methods -------------------------------------------------- //

    private InitElements_(opts: SVConfig) {
        this.canvas_ = ui.dom.Generate('canvas');
        this.controls_ = new __internal.VideoControls();
        this.options_panel_ = new __internal.OptionsPopup(opts);

        // setup the main canvas
        this.canvas_.ID = 'svjs-canvas';
        this.options_panel_.panel.Show(false);
    }

    private AssembleUI_() {
        // append the items to the container
        this.container_.Attach(this.canvas_);
        this.container_.Attach(this.controls_.RootElement);
        this.container_.Attach(this.options_panel_.RootElement);

        // setup the event handlers
        this.controls_.button_settings.SetCallback(() => {
            const visible = this.options_panel_.panel.Visible;
            this.options_panel_.panel.Show(!visible);
            if (visible) {
                this.controls_.button_settings.SetTransform('rotate(0deg)');
            } else {
                this.controls_.button_settings.SetTransform('rotate(30deg)');
            }
        });

        this.controls_.button_fullscreen.SetCallback(() => {
            if (ui.InFullscreenMode()) {
                this.controls_.button_fullscreen.Icon = 'icon-fullscreen';
                ui.ExitFullscreen();
            } else {
                this.controls_.button_fullscreen.Icon = 'icon-fullscreen-exit';
                ui.RequestFullscreen(this.container_);
            }
        });
    }

    // -- private members -------------------------------------------------- //
    private canvas_: ui.dom.Canvas;
    private container_: ui.dom.Div;
    private controls_: __internal.VideoControls;
    private options_panel_: __internal.OptionsPopup;
    private state_: PlayerState;
}

} // namespace svjs::app
