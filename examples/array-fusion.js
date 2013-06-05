/* forall a f g. */
/* a.map(f).map(g) */
/* a.map(compose(f, g)) */

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

// Do both operations in a single pass!
console.log([1, 2, 3].map(add(1)).map(add(2)));
