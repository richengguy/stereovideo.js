namespace svjs.ui {

/**
 * A collection of utilities for creating and manipulating DOM elements.
 * @namespace svjs.ui.dom
 */
export namespace dom {

/**
 * A generic wrapper around an `HTMLElement`.  How the element is generated is
 * left up to the caller.  This is intended to wrap that element and make it
 * easier to track throughout the application.
 * @memberof svjs.ui.dom
 */
export class Item<T extends HTMLElement> {

    /**
     * @param {T} element - any valid `HTMLElement`
     * @param {id=} id - optional ID attribute
     * @param {string=} class_name - optional class name(s) attribute
     */
    public constructor(element: T, id?: string, class_name?: string) {
        this.element_ = element;
        if (id) {
            this.element_.id = id;
        }
        if (class_name) {
            this.element_.className = class_name;
        }
    }

    /**
     * Attach another `HTMLElement` onto the current one as a child element.
     * @param {svjs.ui.dom.Item} other - element that will become a child of
     *      "this" element
     */
    public Attach<S extends HTMLElement>(other: Item<S>): void {
        this.element_.appendChild(other.Element);
    }

    /**
     * Attach another `HTMLElement` onto the current on as a child element.
     * However, unlike {@link svjs.ui.dom.Item.Attach}, make this the *first*
     * child in the list.
     * @param {svjs.ui.dom.Item} other - element to be made a child of "this"
     *      element
     */
    public AttachAsFirst<S extends HTMLElement>(other: Item<S>): void {
        this.element_.insertBefore(other.Element, this.element_.firstChild);
    }

    /**
     * Replaces the current element with another once.  Both elements *must* be
     * of the same type, e.g replacing one `<div>` hierarchy with another one.
     * @param {svjs.ui.dom.Item} other - element that will be replace this one
     */
    public Replace(other: Item<T>): void {
        const parent = this.element_.parentElement;
        if (parent) {
            parent.replaceChild(other.element_, this.element_);
        }
    }

    /**
     * Remove all child nodes from this DOM object.
     */
    public RemoveAllChildren(): void {
        // see: http://stackoverflow.com/a/3955238
        while (this.element_.firstChild) {
            this.element_.removeChild(this.element_.firstChild);
        }
    }

    /**
     * Append a class attribute to the existing attrbute list.
     * @param {string} cls - class name
     */
    public AddClass(cls: string): void {
        this.element_.classList.add(cls);
    }

    /**
     * Remove a class attribute from the existing attribute list.
     * @param {string} cls - class name
     */
    public RemoveClass(cls: string): void {
        this.element_.classList.remove(cls);
    }

    /**
     * If this returns `true` then this DOM item is attached to something else.
     * @return {boolean}
     */
    public HasParent(): boolean {
        return this.element_.parentElement !== null;
    }

    /**
     * The internal `HTMLElement` that this object wraps.
     * @member {T}
     * @readonly
     */
    get Element(): T {
        return this.element_;
    }

    /**
     * The string representation of the element's `class` attribute.
     * @member {string}
     */
    set Class(cls: string) {
        this.element_.className = cls;
    }

    get Class(): string {
        return this.element_.className;
    }

    /**
     * The element's `id` attribute.
     * @member {string}
     */
    set ID(id: string) {
        this.element_.id = id;
    }

    get ID(): string {
        return this.element_.id;
    }

    // -- private members -------------------------------------------------- //
    private element_: T;
}

export type Button = Item<HTMLButtonElement>;
export type Canvas = Item<HTMLCanvasElement>;
export type Div = Item<HTMLDivElement>;
export type Input = Item<HTMLInputElement>;
export type Li = Item<HTMLLIElement>;
export type Span = Item<HTMLSpanElement>;

// svjs::util::dom::Generate() overload signatures.
export function Generate<HTMLButtonElement>(type: 'button'): Button;
export function Generate<HTMLCanvasElement>(type: 'canvas'): Canvas;
export function Generate<HTMLDivElement>(type: 'div'): Div;
export function Generate<HTMLInputElement>(type: 'input'): Input;
export function Generate<HTMLLIElement>(type: 'li'): Li;
export function Generate<HTMLSpanElement>(type: 'span'): Span;
export function Generate<T extends HTMLElement>(type: string): Item<T>;

/**
 * Generate a new `svjs.ui.dom.Item` of a given type.  Please see the
 * documentation for `document.createElement()` for the valid strings.
 * @memberof svjs.ui.dom
 * @param {string} type - element type string
 * @return {svjs.ui.dom.Item} - wrapper around an `HTMLElement`
 */
export function Generate<T extends HTMLElement>(type: string): Item<T> {
    return new Item<T>(<T>document.createElement(type));
}

} // namespace svjs::util::dom
} // namespace svjs::util
