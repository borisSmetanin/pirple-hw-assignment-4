const home = {};
module.exports = home;

const helpers = require('../../lib/helpers');

home.index = (payload, callback) => {

    const 
        menu_items = require('../../assets/menu_items'),
        home_page_data = {
            menu_items: Object.values(menu_items),
            menu_items_json: helpers.pares_object_to_json(menu_items),
            title: 'Home Title',
            show_pizza_slide: true,
            user_is_logged: payload.user_is_logged,
            controller_name: 'home'
        },
        home_page_assets = {
            scripts: [ 'home.js' ]
        };

    helpers.load_web_page('home', home_page_assets, home_page_data, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}
