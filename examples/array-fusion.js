/* forall a f g. */
/* a.map(f).map(g) */
/* a.map(function(a) { return f(g(a)); }) */

function add(a) {
    return function(b) {
        return a + b;
    };
}

// Do both operations in a single pass!
console.log([1, 2, 3].map(add(1)).map(add(2)));
