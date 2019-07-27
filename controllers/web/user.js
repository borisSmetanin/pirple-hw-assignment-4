// Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT

const user = {};

module.exports = user;

const tokens  = require('../api/tokens');
const helpers = require('../../lib/helpers');
const file_model = require('../../lib/file_model');

/**
 * GET user_auth/logout
 * 
 * Acts as a buffer for the real logout function (tokens delete)
 * This is needed in order to avoid exposing token and user email in the app
 * 
 * Token and email are been transferred in here via secure cookies (http only) so front-end scripts can not accesses their data
 * 
 */
user.logout = (payload, callback) => {

    if (payload.user_is_logged) {

        const token_payload = {
            id: payload.request_cookies.token,
            payload: {
                user_email: payload.request_cookies.email
            }
        };
        tokens.delete(token_payload, callback);
    } else {
    
        callback(412, true, {
            message: 'Can not logout when you are not logged in..'
        }); 
    }
}

user.settings = async (payload, callback) => {

    if (payload.user_is_logged) {

        // Get the user
        let user = {};
        try {

            user = await file_model.read_promise('users', helpers.create_user_id(payload.request_cookies.email));
            // Remove password
            ({password, ...user} = user);

        } catch(e) {

            console.log('User was not fount - should not happen');
            console.log('error object', e);
        }

        // Create the dynamic page data
        const 
            user_settings_data = {
                title: 'Settings',
                user_is_logged: payload.user_is_logged,
                controller_name: 'user_settings',
                user: user
            },
            user_settings_assets = {
                scripts: [ 'user_settings.js' ]
            }
    
        // Load the page
        helpers.load_web_page('user_settings', user_settings_assets, user_settings_data, (err, html_page) => {
    
            if ( ! err && html_page) {
                // (http_code, error, payload, response_type
                callback(200, false, html_page, 'html');
            } else {
                callback(500, true, 'something  went wrong!', 'html');
            }
        });
    } else {
        callback(403, true, 'something  went wrong!', 'html');
    }
}