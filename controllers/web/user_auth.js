// Set-Cookie: token=deleted; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT

const user_auth = {};

module.exports = user_auth;

const tokens = require('../api/tokens');

/**
 * GET user_auth/logout
 * 
 * Acts as a buffer for the real logout function (tokens delete)
 * This is needed in order to avoid exposing token and user email in the app
 * 
 * Token and email are been transferred in here via secure cookies (http only) so front-end scripts can not accesses their data
 * 
 */
user_auth.logout = (payload, callback) => {

    if (payload.request_cookies && payload.request_cookies.token && payload.request_cookies.email) {

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