/**
 * Container for different app errors
 */
let errors = {};

// Export the controller at file start to avoid circular dependencies
module.exports = errors;

const helpers = require('../../lib/helpers');

/**
 * Basic Not found error handler for the API
 */
errors.not_found = (payload, callback) => {
    callback(
        404, 
        'Requested route was not found in this server',
    );
}

/**
 * Basic not found error handler for the UI
 */
errors.not_found_web = (payload, callback) => {
    callback(
        404, 
        true,
        'Requested route was not found in this server',
        'html'
    );
}

/**
 * Special error web page generator to display beautified error pages
 */
errors.create_error_web_response = (payload) => {

    return new Promise( (resolve, reject) => {
        const home_page_data = {
            title: payload.http_code,
            error: payload.error,
            user_is_logged: payload.user_is_logged
        };

        helpers.load_web_page('web_error_page', {}, home_page_data, (err, html_page) => {
    
            if ( ! err && html_page) {
                resolve(html_page);
            } else {
                reject(err);
            }
        });
    })
}

 