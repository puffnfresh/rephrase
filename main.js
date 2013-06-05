#!/usr/bin/env node
var rephrase = require('./rephrase'),
    fs = require('fs'),
    _ = require('underscore');

function main() {
    if(process.argv.length > 2) {
        _.each(process.argv.slice(2), function(filename) {
            var source = fs.readFileSync(filename, 'utf8');
            console.log(rephrase.transformSource(source));
        });
        return;
    }

    console.error("Usage: rephrase [<file.js> ...]");
}

if(require.main === module)
    main();
