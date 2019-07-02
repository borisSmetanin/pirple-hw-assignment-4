const orders = {};

module.exports = orders;

const helpers = require('../../lib/helpers');

orders.view = (payload, callback) => {

    let page_data = { 
        title: 'Your Orders',
        user_is_logged: payload.user_is_logged 
    };

    helpers.load_web_page('order_view', [], page_data, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}

orders.cart = (payload, callback) => {

    let page_data = { 
        title: 'Current Order',
        user_is_logged: payload.user_is_logged 
    };
    helpers.load_web_page('order_cart', [], page_data, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}