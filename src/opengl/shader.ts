namespace svjs.opengl {

/**
 * The IDs for the various shader types that can be used in an OpenGL pipeline.
 * @enum
 * @memberof svjs.opengl
 * @property {number} Vertex - vertex shader
 * @property {number} Fragment - fragment shader
 */
export enum ShaderType {
    Vertex,
    Fragment
}

function InternalShaderType(type: ShaderType,
                            gl: WebGLRenderingContext): number {
    switch (type) {
        case ShaderType.Vertex:
            return gl.VERTEX_SHADER;
        case ShaderType.Fragment:
            return gl.FRAGMENT_SHADER;
    }

    return 0;
}

/**
 * Stores the shader source code for easy retrieval later on.
 * @memberof svjs.opengl
 */
export class ShaderSource {

    /**
     * Creates a new ShaderSource object from a shader contained within the
     * original HTML page.
     * @static
     * @param {string} ident - shader's ID attribute
     * @return {ShaderSource} the new ShaderSource object
     */
    public static FromScript(ident: string): ShaderSource {
        let elem = document.getElementById(ident);
        if (!elem || !(elem instanceof HTMLScriptElement)) {
            return null;
        }

        // force object to be treated as a <script> HTML tag element
        let script = <HTMLScriptElement>elem;

        // figure out the shader type from the MIME type
        let type;
        switch (script.type) {
            case 'text/x-glsl-vert':
                type = ShaderType.Vertex;
                break;
            case 'text/x-glsl-frag':
                type = ShaderType.Fragment;
                break;
            default:
                return null; // invalid type
        }

        // get the string data from within the <script> tag
        let str = '';
        let node = script.firstChild;
        while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
                str += node.textContent;
            }
            node = node.nextSibling;
        }

        return new ShaderSource(str, type);
    }

    /**
     * @param {string} vert_src - the vertex shader's GLSL source code
     * @param {number} type - the shader's type (either VERTEX_SHADER or
     *      FRAGMENT_SHADER)
     */
    public constructor(src: string, type: ShaderType) {
        this.shader_src_ = src;
        this.shader_type_ = type;
    }

    /**
     * A string containing the GLSL source code for the particular shader.
     * @member {string}
     */
    set Source(src: string) {
        this.shader_src_ = src;
    }

    get Source(): string {
        return this.shader_src_;
    }

    /**
     * The type of shader, i.e. vertex or fragment.
     * @member {svjs.opengl.ShaderType}
     * @readonly
     */
    get Type(): ShaderType {
        return this.shader_type_;
    }

    // -- private members -------------------------------------------------- //
    private shader_src_: string;
    private shader_type_: ShaderType;
}

interface ShaderDict {
    [key: string]: ShaderSource;
}

interface ShaderCollection {
    [shader_type: number]: ShaderDict;
}

/**
 * Provide a single place to store shaders in the application.
 * @memberof svjs.opengl
 */
export class ShaderLibrary {

    /**
     * Obtains the global ShaderLibrary instance.
     * @static
     * @return {ShaderLibrary}
     */
    public static Instance(): ShaderLibrary {
        if (!ShaderLibrary.instance_) {
            ShaderLibrary.instance_ = new ShaderLibrary();
        }

        return ShaderLibrary.instance_;
    }

    private static instance_: ShaderLibrary = undefined;

    /**
     * Do not use.
     */
    public constructor() {
        if (ShaderLibrary.instance_) {
            throw new Error(
                'use instance() to get an instance of a ShaderLibrary');
        } else {
            this.shaders_ = { };
            this.shaders_[ShaderType.Vertex] = { };
            this.shaders_[ShaderType.Fragment] = { };
        }
    }

    /**
     * Insert a shader into the library.  If the shader already exists with the
     * same name then it will be replaced.  Shaders of different types are
     * stored in their own dictionaries and can use the same names.
     * @param {string} name - name to assign the shader
     * @param {svjs.opengl.ShaderSource} shader - shader's source code
     */
    public Insert(name: string, shader: ShaderSource) {
        this.shaders_[shader.Type][name] = shader;
    }

    /**
     * Retrieve a shader from the library.
     * @param {string} name - name of the shader
     * @param {svjs.opengl.ShaderType} shader_type - shader's type
     */
    public GetShader(name: string, shader_type: ShaderType): ShaderSource {
        return this.shaders_[shader_type][name];
    }

    // -- private members -------------------------------------------------- //
    private shaders_: ShaderCollection;
}

/**
 * Manages access to a GLSL shader object.
 * @memberof svjs.opengl
 */
export class GLSLShader {

    /**
     * Creates a new GLSL shader object from the given source.
     * @param {ShaderSource} src - uncompiled GLSL source code for the shader
     * @param {WebGLRenderContext} gl - rendering context
     */
    constructor(gl: WebGLRenderingContext, src: ShaderSource) {
        this.shader_ = gl.createShader(InternalShaderType(src.Type, gl));
        gl.shaderSource(this.shader_, src.Source);
        gl.compileShader(this.shader_);

        if (!gl.getShaderParameter(this.shader_, gl.COMPILE_STATUS)) {
            console.error(gl.getShaderInfoLog(this.shader_));
            this.success_ = false;
        } else {
            this.type_ = src.Type;
            this.success_ = true;
        }
    }

    /**
     * Retrieves the shader instance.
     * @return {WebGLShader}
     */
    public getGLSLShader(): WebGLShader {
        return this.shader_;
    }

    /**
     * Indicates if the shader had been compiled successfully.
     * @return {boolean}
     */
    public wasCompiled(): boolean {
        return this.success_;
    }

    // -- private members -------------------------------------------------- //
    private shader_: WebGLShader;
    private type_: ShaderType;
    private success_: boolean;
}

/**
 * Specifies the various uniform types within an OpenGL GLSL shader.
 * @memberof svjs.opengl
 * @readonly
 * @enum {number}
 */
export enum GLUniformType {
    boolean_t,  // GLBoolean
    int_t,      // GLint
    float_t,    // GLfloat
    vec2,       // Float32Array (with 2 elements)
    ivec2,      // Int32Array (with 2 elements)
    bvec2,      // sequence<GLboolean> (with 2 elements)
    vec3,       // Float32Array (with 3 elements)
    ivec3,      // Int32Array (with 3 elements)
    bvec3,      // sequence<GLboolean> (with 3 elements)
    vec4,       // Float32Array (with 4 elements)
    ivec4,      // Int32Array (with 4 elements)
    bvec4,      // sequence<GLboolean> (with 4 elements)
    mat2,       // Float32Array (with 4 elements)
    mat3,       // Float32Array (with 9 elements)
    mat4,       // Float32Array (with 16 elements)
    sampler2D,  // GLint
    samplerCube // GLint
}

/**
 * Used to store information about an OpenGL uniform or attribute.
 * @memberof svjs.opengl
 */
export class GLObjectInfo {
    public name: string;
    public type: GLUniformType;

    /**
     * @param {string} name - name of the object
     * @param {GLUniformType} type - a GLenum value that indicates its type
     */
    constructor(name: string, type: number) {
        this.name = name;

        switch (type) {
            case WebGLRenderingContext.BOOL:
                this.type = GLUniformType.boolean_t;
                break;
            case WebGLRenderingContext.INT:
                this.type = GLUniformType.int_t;
                break;
            case WebGLRenderingContext.FLOAT:
                this.type = GLUniformType.float_t;
                break;
            case WebGLRenderingContext.FLOAT_VEC2:
                this.type = GLUniformType.vec2;
                break;
            case WebGLRenderingContext.FLOAT_VEC3:
                this.type = GLUniformType.vec3;
                break;
            case WebGLRenderingContext.FLOAT_VEC4:
                this.type = GLUniformType.vec4;
                break;
            case WebGLRenderingContext.INT_VEC2:
                this.type = GLUniformType.ivec2;
                break;
            case WebGLRenderingContext.INT_VEC3:
                this.type = GLUniformType.ivec3;
                break;
            case WebGLRenderingContext.INT_VEC4:
                this.type = GLUniformType.ivec4;
                break;
            case WebGLRenderingContext.BOOL_VEC2:
                this.type = GLUniformType.bvec2;
                break;
            case WebGLRenderingContext.BOOL_VEC3:
                this.type = GLUniformType.bvec3;
                break;
            case WebGLRenderingContext.BOOL_VEC4:
                this.type = GLUniformType.bvec4;
                break;
            case WebGLRenderingContext.FLOAT_MAT2:
                this.type = GLUniformType.mat2;
                break;
            case WebGLRenderingContext.FLOAT_MAT3:
                this.type = GLUniformType.mat3;
                break;
            case WebGLRenderingContext.FLOAT_MAT4:
                this.type = GLUniformType.mat4;
                break;
            case WebGLRenderingContext.SAMPLER_2D:
                this.type = GLUniformType.sampler2D;
                break;
            case WebGLRenderingContext.SAMPLER_CUBE:
                this.type = GLUniformType.samplerCube;
                break;
        }
    }
}

/**
 * Manages a GLSL program object and its attributes.
 * @memberof svjs.opengl
 */
export class GLSLProgram {

    /**
     * Note: the vertex and fragment shaders can be swapped without any
     * issues.  OpenGL (WebGL) isn't sensitive to the shader type ordering
     * when linking.
     *
     * @param {WebGLRenderingContext} gl - the rendering context
     * @param {GLSLShader} vert - vertex shader
     * @param {GLSLShader} frag - fragment shader
     */
    constructor(gl: WebGLRenderingContext, vert: GLSLShader, frag: GLSLShader) {
        this.prog_ = gl.createProgram();
        gl.attachShader(this.prog_, vert.getGLSLShader());
        gl.attachShader(this.prog_, frag.getGLSLShader());
        gl.linkProgram(this.prog_);

        if (!gl.getProgramParameter(this.prog_, gl.LINK_STATUS)) {
            console.error(gl.getProgramInfoLog(this.prog_));
            this.success_ = false;
        } else {
            this.success_ = true;
        }

        let i = 0;
        let info = null;

        let num_uniform = gl.getProgramParameter(this.prog_,
                                                 gl.ACTIVE_UNIFORMS);
        this.uniforms_ = new Object();
        for (i = 0; i < num_uniform; i++) {
            info = gl.getActiveUniform(this.prog_, i);
            this.uniforms_[info.name] = new GLObjectInfo(info.name, info.type);
        }

        let num_attrib = gl.getProgramParameter(this.prog_,
                                                gl.ACTIVE_ATTRIBUTES);
        this.attributes_ = new Object();
        for (i = 0; i < num_attrib; i++) {
            info = gl.getActiveAttrib(this.prog_, i);
            this.attributes_[info.name] = new GLObjectInfo(info.name,
                                                           info.type);
            gl.enableVertexAttribArray(i);
        }
    }

    /**
     * Binds the shader to the current OpenGL context.  This must be called
     * before the shader is used.
     * @param {WebGLRenderingContext} gl - rendering context
     */
    public useProgram(gl: WebGLRenderingContext) {
        gl.useProgram(this.prog_);
    }

    /**
     * List all of the attributes associated with the particular shader.
     * @return {Array<string>} an array of strings
     */
    public listAttributes(): Array<string> {
        let out = new Array<string>();

        for (let key in this.attributes_) {
            if (this.attributes_.hasOwnProperty(key)) {
                out.push(key);
            }
        }

        return out;
    }

    /**
     * List all uniforms associated with the particular shader.
     * @return {Array<string>} an array of strings
     */
    public listUniforms(): Array<string> {
        let out = new Array<string>();

        for (let key in this.uniforms_) {
            if (this.attributes_.hasOwnProperty(key)) {
                out.push(key);
            }
        }

        return out;
    }

    /**
     * Get information about a particular attribute.
     * @param {string} attr - name of the attribute
     * @return {GLObjectInfo} attribute type information
     */
    public getAttributeInfo(attr: string): GLObjectInfo {
        if (this.attributes_.hasOwnProperty(attr)) {
            return this.attributes_[attr];
        }
        return null;
    }

    /**
     * Gets the location (index) of the shader attribute.
     * @param {WebGLRenderingContext} gl - rendering context
     * @param {string} attr - name of the attribute
     * @return {number}
     */
    public getAttributeLocation(gl: WebGLRenderingContext,
                                attr: string): number {
        if (this.attributes_.hasOwnProperty(attr)) {
            return gl.getAttribLocation(this.prog_, attr);
        }
        return null;
    }

    /**
     * Get information about a particular uniform.
     * @param {string} uni - name of the uniform
     * @return {GLObjectInfo} uniform type information
     */
    public getUniformInfo(uni: string): GLObjectInfo {
        if (this.uniforms_.hasOwnProperty(uni)) {
            return this.uniforms_[uni];
        }
        return null;
    }

    /**
     * Get the reference to the particular shader uniform object.
     * @param {WebGLRenderingContext} gl - rendering context
     * @param {string} uni - name of the uniform object
     * @return {WebGLUniformLocation}
     */
    public getUniformLocation(gl: WebGLRenderingContext,
                              uni: string): WebGLUniformLocation {
        if (this.uniforms_.hasOwnProperty(uni)) {
            return gl.getUniformLocation(this.prog_, uni);
        }
        return null;
    }

    /**
     * Set the value of a uniform object (type handled automatically).
     * @param {WebGLRenderingContext} gl - rendering context
     * @param {string} uni - name of the uniform
     * @param {object} value - value to set in the uniform
     */
    public setUniform(gl: WebGLRenderingContext, uni: string, value: any) {
        if (!this.uniforms_.hasOwnProperty(uni)) {
            return;
        }

        let info = <GLObjectInfo>this.uniforms_[uni];
        let location = gl.getUniformLocation(this.prog_, uni);

        // ugly but it's easy to understand
        switch (info.type) {
            // scalar values
            case GLUniformType.boolean_t:
            case GLUniformType.int_t:
                gl.uniform1i(location, value);
                break;
            case GLUniformType.float_t:
                gl.uniform1f(location, value);
                break;
            // floating-point vectors
            case GLUniformType.vec2:
                gl.uniform2fv(location, value);
                break;
            case GLUniformType.vec3:
                gl.uniform3fv(location, value);
                break;
            case GLUniformType.vec4:
                gl.uniform4fv(location, value);
                break;
            // integer vectors
            case GLUniformType.bvec2:
            case GLUniformType.ivec2:
                gl.uniform2iv(location, value);
                break;
            case GLUniformType.bvec3:
            case GLUniformType.ivec3:
                gl.uniform3iv(location, value);
                break;
            case GLUniformType.bvec4:
            case GLUniformType.ivec4:
                gl.uniform4iv(location, value);
                break;
            // matrix types
            case GLUniformType.mat2:
                gl.uniformMatrix2fv(location, false, value);
                break;
            case GLUniformType.mat3:
                gl.uniformMatrix3fv(location, false, value);
                break;
            case GLUniformType.mat4:
                gl.uniformMatrix4fv(location, false, value);
                break;
            // sampler types
            case GLUniformType.sampler2D:
                gl.uniform1i(location, value);
                break;
            case GLUniformType.samplerCube:
                gl.uniform1i(location, value);
                break;
        }
    }

    // -- private members -------------------------------------------------- //
    private prog_: WebGLProgram;
    private success_: boolean;
    private uniforms_: Object;
    private attributes_: Object;
}

} // namespace svjs::opengl
