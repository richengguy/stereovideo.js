namespace svjs.opengl {

// See below for documentation.
export interface Dimensions {
    width: number;
    height: number;
};

export function IsDimensions(object: any): object is Dimensions {
    return object.width !== undefined && object.height !== undefined;
}

/**
 * Defines an object that describes something with a width and height.
 * @name Dimensions
 * @interface
 * @memberof svjs.opengl
 * @property width {number} - item width
 * @property height {number} - item height
 */

/**
 * A concrete object that implements the Dimensions interface.
 * @memberof svjs.opengl
 * @implements svjs.opengl.Dimensions
 * @property width {number}
 * @property height {number}
 */
export class Size implements Dimensions {

    /**
     * The constructor has two forms: one that accepts another object that
     * implements the Dimensions interface of two numbers that contain the
     * width and height.
     * @param w {Dimensions | number} - another Dimensions object or a width
     *      value
     * @param h {number=} - the height (unused if first argument was a
     *      Dimensions object)
     */
    public constructor(w: number | Dimensions, h?: number) {
        if (typeof w === 'number') {
            this.width = w;
            this.height = h;
        } else {
            this.width = w.width;
            this.height = w.height;
        }
    }

    public width: number;
    public height: number;
};

} // namespace svjs::opengl
