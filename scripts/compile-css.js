'use strict';

let fs = require('fs');
let path = require('path');
let postcss = require('postcss');
let sass = require('node-sass');

function main(src, dst, paths) {
    src = path.resolve(src);

    let opts = {
        file: src
    };

    if (paths) {
        opts.includePaths = paths;
    }

    // Generate the output CSS using node-sass.
    let result;
    try {
        result = sass.renderSync(opts);
    } catch(error) {
        console.error('ERROR \'%s\' [%d:%d] - %s',
                      path.relative(process.cwd(), error.file), error.line,
                      error.column, error.message);
        process.errorCode = -1;
        return;
    }

    // Now run it through the PostCSS autoprefixer to add in an extra
    // browser-specific prefixes.
    postcss([
        require('autoprefixer'),
        require('cssnano')
    ]).process(result.css.toString()).then((output) => {
        fs.writeFileSync(path.resolve(dst), output.css);
    }, (error) => {
        if (error.message && error.showSourceCode !== undefined) {
            console.error(error.message, error.showSourceCode());
        } else {
            console.error('PostCSS :: ', error.toString());
        }
        process.exitCode = -1;
    });
}

if (require.main === module) {
    const src = process.argv[2];
    const dst = process.argv[3];

    let paths = [];
    process.argv.forEach((element, index) => {
        if (index > 3) {
            paths.push(element);
        }
    });

    main(src, dst, paths);
}

module.exports = main;
