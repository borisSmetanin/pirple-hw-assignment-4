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

/**
 * GET orders/cart
 * 
 * Page for managing the order
 */
orders.cart = (payload, callback) => {

    const menu_items = require('../../assets/menu_items');

    let page_data = { 
        title: 'Current Order',
        user_is_logged: payload.user_is_logged,
        menu_items_json: helpers.pares_object_to_json(menu_items),
        controller_name: 'cart'
    },
    home_page_assets = {
        scripts:  [ 'cart.js' ],
        partials: [ 'cart' ]
    };;
    helpers.load_web_page('order_cart', home_page_assets, page_data, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}