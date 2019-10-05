const admin_interface = {};

module.exports = admin_interface;

// load modules
const readline = require('readline');
const helpers  = require('../../lib/helpers');

/**
 * Generates help menu for different commands
 */
admin_interface.help = () => {

    // Generate the title
    helpers.horizontal_cli_space();
    helpers.create_cli_title('H E L P');
    helpers.horizontal_cli_space();

    // Loop on the commands in order to create the payload for the CLi table helper
    let help_columns = [];
    for (let [command, action] of Object.entries(actions_map)) {

        if (action.id) {
            command+=' '+ action.id;
        }
        help_columns.push([
            command,
            action.title
        ]);
    }

    // Show the help table
    helpers.create_cli_table(['Command', 'Explanation'], help_columns);
}

admin_interface.show_menu = () => {
    console.log('admin_interface.show_menu');
}

admin_interface.show_orders = () => {
    console.log('admin_interface.show_orders');
}

admin_interface.show_order = (order_id) => {
    console.log('admin_interface.show_order');
}

admin_interface.show_users = () => {
    console.log('admin_interface.show_users');
}

admin_interface.show_user = (user_email) => {
    console.log('admin_interface.show_user');
}

// Map all actions
const actions_map = {
    'help': {
        execute: admin_interface.help,
        title: 'Show all admin interface actions'
    },
    'man': {
        execute: admin_interface.help,
        title: 'Alias to help'
    },
    'show menu' : {
        execute: admin_interface.show_menu,
        title: 'View all the current menu items' 
    },

    'show orders' : {
        execute: admin_interface.show_orders,
        title: 'View all the recent orders in the system (orders placed in the last 24 hours)' 
    },

    'show order' : {
        execute: admin_interface.show_order,
        title: 'Lookup the details of a specific order by order ID',
        id: '--<order_id>'
    },

    'show users' : {
        execute: admin_interface.show_users,
        title: 'View all the users who have signed up in the last 24 hours' 
    },

    'show user' : {
        execute: admin_interface.show_user,
        title: 'Lookup the details of a specific user by email address',
        id: '--<user_email>' 
    }
};

/**
 * Process CLI action
 */
admin_interface.process_action = (input, cli_interface) => {

    input = input.trim().toLowerCase();

    const input_arr = input.split('--');
    const action_name = input_arr[0].trim();

    if (actions_map.hasOwnProperty(action_name)) {

        const flag = typeof input_arr[1] === 'string' && input_arr[1].trim().length > 0 
            ? input_arr[1].trim() 
            : false;

        actions_map[action_name].execute(flag);
    } else {
        console.log('Action was not found');
        actions_map.help.execute();
    }
    cli_interface.prompt();
}

//=== Helpers ====================================/

admin_interface.create_title = () => {
    
}

/**
 * Initialize the interface
 */
admin_interface.init = () => {
    
    // Start CLI interface
    const cli_interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt:'>'
    });

    cli_interface.prompt();

    cli_interface.on('line', (input) => {
        admin_interface.process_action(input, cli_interface);
    });

    cli_interface.on('close', () => {
        process.exit(0);
    });
}