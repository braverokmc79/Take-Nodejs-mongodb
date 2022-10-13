const express = require('express');
const router = express.Router();


router.get('/count', function (req, res, next) {
    let count = 0;
    if (req.signedCookies.count) count = Number(req.signedCookies.count);

    count += 1;
    res.cookie("count", count, { signed: true });
    res.render('cookies/count', { count: count });
});


const products = {
    1: { title: 'The history of web' },
    2: { title: 'The next web' }
}

router.get("/products", function (req, res, next) {
    let output = '<ul>';
    for (let item in products) {
        output += `<li>
            <a href="/cookies/cart/${item}">${products[item].title}</a>
        </li>`;
    }
    output += '</ul>';
    res.render('cookies/proudcts', { output: output, products: products });
});





router.get("/cart", function (req, res, next) {
    const cart = req.signedCookies.cart;
    let output = '';
    if (!cart) {
        res.send('Empty!');
    } else {
        output = '<ul>';
        for (let id in cart) {
            output += `<li>${products[id].title}(${cart[id]})</li>`;
        }
        output += "</ul>";
    }

    res.render("cookies/cart", { output: output });
});


router.get("/cart/:id", function (req, res, next) {
    const id = req.params.id;
    let cart = {};
    if (req.signedCookies.cart) {
        cart = req.signedCookies.cart;
    }

    if (!cart[id]) cart[id] = 0;
    cart[id] = parseInt(cart[id]) + 1;

    res.cookie('cart', cart, { signed: true });
    res.redirect('/cookies/cart');
})



module.exports = router;

