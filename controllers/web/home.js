const home = {};

const helpers = require('../../lib/helpers');

module.exports = home;

home.index = (payload, callback) => {

    helpers.load_web_page('home', [], {title: 'Home Title'}, (err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}

home.test = (payload, callback) => {

    const file_model = require('../../lib/file_model');

    file_model.read_html('html_pages', 'test',(err, html_page) => {

        if ( ! err && html_page) {
            // (http_code, error, payload, response_type
            callback(200, false, html_page, 'html');
        } else {
            callback(500, true, 'something  went wrong!', 'html');
        }
    });
}
