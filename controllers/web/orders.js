const orders = {};

module.exports = orders;

const 
    helpers    = require('../../lib/helpers'),
    api_orders = require('../api/orders');
    file_model = require('../../lib/file_model'),
    menu_items = require('../../assets/menu_items');


orders.view = (payload, callback) => {

    if (payload.user_is_logged) {

        api_orders.get_collection(payload, async (http_code, err, data ) => {
            
            if ( ! err && data && data.orders) {
    
                const orders = [];

                for(let i=0; i < data.orders.length; i++) {

                    let order_data = await file_model.read_promise('orders', data.orders[i]); 

                    ({payment_data, menu, errors, ...order_data} = order_data);


                    order_data.order = Object.entries(order_data.order).map( order => {
                        let [item, amount] = order;
                        return {
                            title: menu[item].title,
                            amount: amount
                        }
                    });

                    let order_date          = new Date(order_data.time);
                    order_data.display_date = `${order_date.toDateString()} (${order_date.getHours()}:${order_date.getMinutes()})`;
                    order_data.id           =  order_data.id.split('_')[0];
                    
                    orders.push(order_data);
                }

                const 
                    page_data = { 
                        title: 'Your Orders',
                        user_is_logged: payload.user_is_logged,
                        order_data: orders,
                        controller_name: 'orders'
                    },
                    assets = {
                        scripts: [ 'orders.js' ]
                    }
                helpers.load_web_page('order_view', assets, page_data, (err, html_page) => {
            
                    if ( ! err && html_page) {
                        callback(200, false, html_page, 'html');
                    } else {
                        callback(500, true, 'something  went wrong!', 'html');
                    }
                });
            } else {
                callback(500, true, 'something  went wrong!', 'html'); 
            }
        });
    } else {
        callback(403, true, 'You must be logged in order to see this page', 'html');
    }
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
        partials: [ 'cart', 'complete_payment' ]
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