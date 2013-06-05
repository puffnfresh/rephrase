#!/usr/bin/env node
var rephrase = require('./rephrase'),
    fs = require('fs'),
    esprima = require('esprima'),
    escodegen = require('escodegen'),
    _ = require('underscore');

function groups(a, n) {
    var g = [],
        h,
        i,
        j;

    for(i = 0; i <= a.length - n; i++) {
        h = [];
        for(j = 0; j < n; j++) {
            h.push(a[i + j]);
        }
        g.push(h);
    }

    return g;
}

function processFile(filename) {
    var source = fs.readFileSync(filename, 'utf8'),
        tree = esprima.parse(source, {comment: true}),

        blockComments = _.filter(tree.comments, function(c) {
            return c.type == 'Block';
        }),
        rules = _.map(
            _.filter(
                groups(blockComments, 3),
                function(g) {
                    return g[0].value.match(rephrase.forallRe);
                }
            ),
            function(g) {
                return rephrase.makeRule(g[0].value, esprima.parse(g[1].value), esprima.parse(g[2].value));
            }
        );

    return escodegen.generate(_.reduce(rules, rephrase, tree));
}

function main() {
    if(process.argv.length > 2) {
        _.each(process.argv.slice(2), function(filename) {
            console.log(processFile(filename));
        });
        return;
    }

    console.error("Usage: rephrase [<file.js> ...]");
}

if(require.main === module)
    main();
