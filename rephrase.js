var estraverse = require('estraverse'),
    _ = require('underscore'),
    Option = require('fantasy-options');

function access(object, name) {
    return object.chain(function(o) {
        if(name in o)
            return Option.Some(o[name]);

        return Option.None;
    });
}

function object(name, value) {
    var r = {};
    r[name] = value;
    return r;
}

function extend(a, b) {
    var r = {},
        k;

    for(k in a) {
        r[k] = a[k];
    }

    for(k in b) {
        if(k in r)
            return Option.None;

        r[k] = b[k];
    }

    return Option.Some(r);
}

function substitutions(tree, boundFrom, from) {
    var subs = Option.Some({}),
        name;

    function skip(controller) {
        controller.skip();
    }

    function quit(controller) {
        subs = Option.None;
        controller['break']();
    }

    function equalNode(controller, node, fromNode) {
        var name;

        for(name in node) {
            if(_.isArray(node[name])) {
                _.each(node[name], function(n) {
                    if(n.type)
                        return;

                    equalNode(controller, n, fromNode[name]);
                });
            } else if(typeof node[name] == 'object') {
                if(node[name].type) {
                    // Should be traversed later on.
                    continue;
                }
                throw new Error("TODO");
            } else if(node[name] != fromNode[name]) {
                return quit(controller);
            }
        }
    }

    estraverse.traverse(tree, {
        enter: function(node) {
            var controller = this;
            _.reduce(controller.path(), access, Option.Some(from)).fold(
                function(fromNode) {
                    if(boundFrom.indexOf(fromNode) != -1) {
                        subs = subs.chain(function(s) {
                            return extend(s, object(fromNode.name, node));
                        });
                        return skip(controller);
                    }

                    equalNode(controller, node, fromNode);
                },
                function() {
                    quit(controller);
                }
            );
       }
    });

    return subs;
}

function substitute(subs, boundTo, to) {
    return estraverse.replace(to, {
        enter: function(node) {
            if(boundTo.indexOf(node) == -1)
                return;

            return subs[node.name];
        }
    });
}

function rephrase(tree, rule) {
    return estraverse.replace(tree, {
        enter: function(node) {
            return substitutions(node, rule.boundFrom, rule.from).fold(
                function(subs) {
                    return substitute(subs, rule.boundTo, rule.to);
                },
                function() {
                    return node;
                }
            );
        }
    });
}

function unwrapProgram(tree) {
    if(tree.type != 'Program')
        return tree;

    if(tree.body.length > 1)
        throw new Error('Trying to use a rewrite rule with multiple statements.');

    return tree.body[0].expression;
}

rephrase.forallRe = /forall((\s+[a-z]+)*)\s*\./;
rephrase.makeRule = function(forall, from, to) {
    var escope = require('escope'),
        bound = forall.match(rephrase.forallRe)[1].split(/\s+/).slice(1),
        boundFrom,
        boundTo;

    function isBound(i) {
        return bound.indexOf(i.name) != -1;
    }

    function getBoundThrough(t) {
        var identifiers = _.map(escope.analyze(t).scopes[0].through, function(t) {
            return t.identifier;
        });
        return _.filter(identifiers, isBound);
    }

    from = typeof from == 'string' ? require('esprima').parse(from) : from;
    to = typeof to == 'string' ? require('esprima').parse(to) : to;

    boundFrom = getBoundThrough(from);
    boundTo = getBoundThrough(to);

    return {
        boundFrom: boundFrom,
        from: unwrapProgram(from),
        boundTo: boundTo,
        to: unwrapProgram(to)
    };
};

if(typeof module != 'undefined')
    module.exports = rephrase;
