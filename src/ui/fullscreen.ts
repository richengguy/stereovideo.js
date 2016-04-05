/// <reference path='./dom.ts' />

namespace svjs.ui {

const kFullscreenEnabledNames = [
    'fullscreenEnabled',
    'webkitFullscreenEnabled',
    'mozFullScreenEnabled',
    'msFullscreenEnabled'
];

const kRequestFullscreenNames = [
    'requestFullscreen',
    'webkitRequestFullscreen',
    'mozRequestFullScreen',
    'msRequestFullscreen'
];

const kExitFullscreenNames = [
    'exitFullscreen',
    'webkitExitFullscreen',
    'mozCancelFullScreen',
    'msExitFullscreen'
];

const kFullscreenChangeNames = [
    'fullscreenchange',
    'webkitfullscreenchange',
    'mozfullscreenchange',
    'MSFullscreenChange'
];

const kFullscreenElementNames = [
    'fullscreenElement',
    'webkitFullscreenElement',
    'mozFullScreenElement',
    'msFullscreenElement'
];

/**
 * Checks to see if there if the fullscreen API could be properly enabled.
 * @memberof svjs.ui
 * @return {boolean} 'true' if fullscreen requests will work
 */
export function FullscreenAvailable(): boolean {
    for (let fn of kFullscreenEnabledNames) {
        if (document[fn]) {
            return true;
        }
    }

    return false;
}

/**
 * Requests that the given element appear fullscreen.
 * @memberof svjs.ui
 * @param {HTMLElement} elem - element that should be shown fullscreen
 * @return {boolean} - `true` if the fullscreen request was successful
 */
export function RequestFullscreen(elem: dom.Div): boolean {
    const tag = elem.Element;
    for (let fn of kRequestFullscreenNames) {
        if (tag[fn]) {
            tag[fn]();
            return true;
        }
    }

    return false;
}

/**
 * Request to exit fullscreen mode.
 * @memberof svjs.ui
 */
export function ExitFullscreen() {
    for (let fn of kExitFullscreenNames) {
        if (document[fn]) {
            document[fn]();
            break;
        }
    }
}

/**
 * Registers an event handler to listen for a fullscreen change event.
 * @memberof svjs.ui
 * @param {function} cb - callback (no input arguments)
 */
export function ListenForFullscreen(cb: () => void) {
    kFullscreenChangeNames.forEach((event: string) => {
        document.addEventListener(event, () => {
            cb();
        });
    });
}

/**
 * Informs the application if fullscreen mode is currently on.
 * @memberof svjs.ui
 * @return {boolean}
 */
export function InFullscreenMode(): boolean {
    for (let fn of kFullscreenElementNames) {
        if (document[fn]) {
            return true;
        }
    }

    return false;
}

} // namespace svjs.ui
