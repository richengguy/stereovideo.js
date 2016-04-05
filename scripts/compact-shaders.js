'use strict';

let fs = require('fs');
let path = require('path');

// Remove all whitespace from the start and end of a file.
function removeWhitespace(contents) {
    let processed = contents;
    processed = processed.split(/\n|\r|\f/);
    processed = processed.map((element) => {
        return element.replace(/^\s+/, '');
    });
    return processed.join('');
}

// Performs the whitespace removal and stores the results into a
function main(files) {
    let shaders = {
        'frag': { },
        'vert': { }
    };

    let generated =
        'function __init_shaders() {\n' +
        '    let library = svjs.opengl.ShaderLibrary.Instance();\n';

    files.forEach((value) => {
        let contents = fs.readFileSync(path.resolve(value), 'utf8');
        let compact = removeWhitespace(contents);

        let extn = path.extname(value);
        let base = path.basename(value, extn);

        let type;
        if (extn === '.frag') {
            type = 'svjs.opengl.ShaderType.Fragment';
        } else if (extn === '.vert') {
            type = 'svjs.opengl.ShaderType.Vertex';
        } else {
            console.warn('Unknown file type for "' + value + '"...skipping.');
            return;
        }

        generated += '    library.Insert(\n' +
                     '        "' + base + '",\n' +
                     '        new svjs.opengl.ShaderSource(\n' +
                     '            "' + compact + '",\n' +
                     '            ' + type + '));\n';
    });

    generated += '}\n__init_shaders();';
    return generated
}

// Same reason as using an "if __name__ == '__main__'" in Python.
if (require.main === module) {
    let args = [];
    process.argv.forEach((value, index) => {
        if (index > 1) {
            args.push(value);
        }
    });
    console.log(main(args));
}

module.exports = main;
