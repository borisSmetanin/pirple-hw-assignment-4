const orders = {};

module.exports = orders;

const helpers = require('../../lib/helpers');

orders.view = (payload, callback) => {

    helpers.load_web_page('order_view', [], { title: 'Your Orders' }, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}

orders.cart = (payload, callback) => {

    helpers.load_web_page('order_cart', [], { title: 'Current Order' }, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}