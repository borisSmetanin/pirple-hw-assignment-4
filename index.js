
// TODO
// 1. create users settings page
// 2. show 500 / 403/ 404 error pages
// 3. PWA - when order is complete - pop push notification
// 4. PWA - use webworker to keep session alive by sending session refresh requests every 30 min after login
// 5. make sure all errors are shown as 'toasts'
// 6. make sure cart btns are responsive
let server = require('./lib/server');

/**
 * Container for the app
 */
let app = {};

app.init = () => {
    // Initialize the server
    server.serve();
}

// Start the application
app.init();