/**
 * The {@link svjs.ui.UiElement} interface must be implemented by an object
 * that has a visible representation an can be controlled by the user.
 * @name UiElement
 * @interface
 * @memberof svjs.ui
 */
/**
 * @function GetElement
 * @memberof svjs.ui.UiElement
 * @return {svjs.ui.dom.Item} - the generated DOM graph that will be attached
 *      to the main display page
 */
/**
 * A {@link svjs.ui.TransformableUiElement} is a type of
 * {@link svjs.ui.UiElement} that can accept various CSS-based transformations.
 * @name TransformableUiElement
 * @interface
 * @memberof svjs.ui
 * @extends svjs.ui.UiElement
 */
/**
 * @function SetTransform
 * @memberof svjs.ui.TransformableUiElement
 * @param {string} tfrm - CSS transformation property value
 */

/// <reference path='./dom.ts' />

/**
 * @namespace svjs.ui
 */
namespace svjs.ui {

export interface UiElement {
    GetElement<T extends HTMLElement>(): dom.Item<T>;
}

export interface TransformableUiElement extends UiElement {
    SetTransform(tfrm: string): void;
}

} // namespace svjs::ui
