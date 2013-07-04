# Rephrase

Rewrite rules for JavaScript.

## What?

A rewrite rule is represented as three consecutive block comments
in a JavaScript file:

```javascript
/* forall a f g. */
/* a.map(f).map(g) */
/* a.map(compose(f, g)) */
```

The above means whenever we see an expression that looks like
`a.map(f).map(g)` (where `a`, `f` and `g` are "holes"), then we can
replace that expression with `a.map(function(a) { return f(g(a)); })`
(with `a`, `f` and `g` filled in with what occured in the first
expression).

After we put the above in the header of a JavaScript file, we can
write code like so:

```javascript
function compose(f, g) {
    return function(x) {
        return f(g(x));
    };
}

function add(a) {
    return function(b) {
        return a + b;
    };
}

console.log([1, 2, 3].map(add(1)).map(add(2)));
```

This original code is mapping over our array twice. Those two passes
should be done in one.

If we use the `rephrase` command, we will get the rewritten JavaScript
output:

```javascript
function compose(f, g) {
    return function (x) {
        return f(g(x));
    };
}
function add(a) {
    return function (b) {
        return a + b;
    };
}
console.log([
    1,
    2,
    3
].map(compose(add(1), add(2))));
```

There is now only a single `map` call. Much more efficient!

## Usage

Command-line:

    npm install -g rephrase
    rephrase examples/array-fusion.js

From repository:

    node main.js examples/array-fusion.js
