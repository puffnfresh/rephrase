/* forall a f g. */
/* a.map(f).map(g) */
/* a.map(function(a) { return f(g(a)); }) */

var add1 = add(1),
    add2 = add(2);

function add(a) {
    return function(b) {
        return a + b;
    };
}

// Do both operations in a single pass!
console.log([1, 2, 3].map(add1).map(add2));
