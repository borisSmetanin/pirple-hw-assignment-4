
const server = require('./lib/server');
const admin_interface_cli = require('./controllers/cli/admin_interface');

/**
 * Container for the app
 */
const app = {};

app.init = () => {
    // Initialize the server
    server.serve();

    // Start the admin interface after server was initialized
    setTimeout(() => {
        admin_interface_cli.init();
    }, 50);
}

// Start the application
app.init();