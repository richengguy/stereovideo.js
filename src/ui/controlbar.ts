/// <reference path='./dom.ts' />

/**
 * @namespace svjs.ui
 */
namespace svjs.ui {

/**
 * A button that appears in the player's control bar.  Each button has no
 * text and is composed of a single icon.  The icons are referred to by the
 * variable names in the `_variables.scss` stylesheet.
 * @memberof svjs.ui
 * @implements svjs.ui.TransformableUiElement
 */
export class Button implements TransformableUiElement {

    /**
     * @param {string} icon - button's icon
     * @param {string=} id? - optional ID attribute
     */
    public constructor(icon: string, id?: string) {
        this.button_ = dom.Generate('button');
        this.Icon = icon;

        if (id) {
            this.button_.ID = id;
        }
    }

    /**
     * Specify the callback to respond to any button "click" events.
     * @param cb - callback function (takes no arguments)
     */
    public SetCallback(cb: () => void) {
        this.button_.Element.onclick = cb;
    }

    /**
     * The icon that the button is currently using.  All icon names map
     * directly to a CSS class that begins with `svjs-button-`.
     * @member {string}
     */
    get Icon(): string {
        return this.icon_;
    }

    set Icon(icon: string) {
        if (this.icon_) {
            this.button_.RemoveClass('svjs-button-' + this.icon_);
        }
        this.icon_ = icon;
        this.button_.AddClass('svjs-button-' + this.icon_);
    }

    // -- interface implementation ----------------------------------------- //

    public SetTransform(tfrm: string) {
        this.button_.Element.style.transform = tfrm;
    }

    public GetElement(): dom.Button {
        return this.button_;
    }

    // -- private members -------------------------------------------------- //
    private button_: dom.Button;
    private icon_: string;
}

/**
 * A collection of #{svjs.ui.Button} elements that are grouped together.
 * @memberof svjs.ui
 * @implements svjs.ui.UIElement
 */
export class ButtonGroup implements UiElement {

    /**
     * @param {string} name - name of the button group (used by the stylesheet)
     * @param {string=} id - optional ID attribute
     */
    public constructor(name: string, id?: string) {
        this.group_ = dom.Generate('span');
        this.group_.AddClass(name);

        if (id) {
            this.group_.ID = id;
        }
    }

    /**
     * Add a button to the button group.  Buttons are inserted in a
     * left-to-right, top-to-bottom order.
     * @param {svjs.ui.Button} button - button to add to the button group
     * @return {svjs.ui.ButtonGroup} - returns itself to support chaining
     */
    public Add(button: Button): ButtonGroup {
        this.group_.Attach(button.GetElement());
        return this;
    }

    // -- interface methods ------------------------------------------------ //

    public GetElement(): dom.Span {
        return this.group_;
    }

    // -- private members -------------------------------------------------- //
    private group_: dom.Span;
}

/**
 * A control bar is a top-level element that shows a set of buttons that can be
 * clicked on by the user.  Each button is comprised of a single icon and no
 * text.  The styling is controlled by the 'controls.scss' stylesheet.
 * @memberof svjs.ui
 * @implements svjs.ui.UiElement
 */
export class ControlBar implements UiElement {

    /**
     * @param {string=} id - optional ID attribute
     */
    public constructor(id?: string) {
        this.control_bar_ = dom.Generate('div');
        this.control_bar_.AddClass('svjs-controls');
        if (id) {
            this.control_bar_.ID = id;
        }
    }

    public AddButton(button: Button | ButtonGroup) {
        this.control_bar_.Attach(button.GetElement());
    }

    // -- interface methods ------------------------------------------------ //

    public GetElement(): dom.Div {
        return this.control_bar_;
    }

    // -- private members -------------------------------------------------- //
    private control_bar_: dom.Div;
}

} // namespace svjs::ui
