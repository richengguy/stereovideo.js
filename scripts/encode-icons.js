'use strict';

let fs = require('fs');
let mime = require('mime');
let path = require('path');

function main(files) {
    let generated = '/* Automatically Generated - DO NOT MODIFY */\n';
    files.forEach((entry) => {
        let extn = path.extname(entry);
        let base = path.basename(entry, extn);

        let mime_type = mime.lookup(entry);

        let data = fs.readFileSync(path.resolve(entry));
        generated += '$img_' + base + ': url(data:' + mime_type + ';base64,';
        generated += data.toString('base64');
        generated += ');\n';
    });

    return generated;
}

if (require.main === module) {
    let args = [];
    process.argv.forEach((entry, index) => {
        if (index > 1) {
            args.push(entry);
        }
    });
    console.log(main(args));
}
module.exports = main;
