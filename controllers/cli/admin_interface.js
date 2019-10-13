const admin_interface = {};

module.exports = admin_interface;

// load modules
const readline   = require('readline');
const helpers    = require('../../lib/helpers');
const menu_items = require('../../assets/menu_items');
const file_model = require('../../lib/file_model');

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

/**
 * Show menu items
 */
admin_interface.show_menu = () => {

    // Generate the title
    helpers.horizontal_cli_space();
    helpers.create_cli_title('M E N U');
    helpers.horizontal_cli_space();

    // Get the first menu to generate the columns
    const menu_table_headers = Object.keys(Object.values(menu_items)[0]);

    const menu_table_rows = [];

    // Extract the values for the table format
    Object.values(menu_items).forEach((menu_item) => {
        menu_table_rows.push(Object.values(menu_item));
    });

    // Generate the menu table
    helpers.create_cli_table(menu_table_headers, menu_table_rows);
}

/**
 * Show orders (last 24 Hours)
 */
admin_interface.show_orders = () => {

    helpers.horizontal_cli_space();
    helpers.create_cli_title('O R D E R S  (from the last 24 hours)');
    helpers.horizontal_cli_space();

    file_model.read_collection('orders', null, (err, order_names) => {

        if (err) {
            helpers.create_cli_centered_message('We have internal error');
            return false;
        }

        if ( ! order_names.length) {
            helpers.create_cli_centered_message('No Results');
            return false;
        }
        
        //  Each orders is saved with milliseconds timestamp
        // 3600000 is one hour in milliseconds
        // There for 3600000 * 24 === 86400000 which is 24 hours milliseconds timestamp;
        const twenty_four_hours_ago = Date.now() - 86400000;
        const recent_order_names = order_names.filter((order) => {
             const order_timestamp = order.split('_')[1];
             return order_timestamp >= twenty_four_hours_ago;
        });

        if ( ! recent_order_names.length) {
            helpers.create_cli_centered_message('No Results');
            return false;
        }

        create_orders_table(recent_order_names);
    });
}

/**
 * Show order by order ID
 * 
 * @param order_id {string}
 */
admin_interface.show_order = (order_id) => {
    
    helpers.horizontal_cli_space();
    helpers.create_cli_title(`O R D E R  --${order_id}`);
    helpers.horizontal_cli_space();

    create_orders_table([order_id]);
}

/**
 * Show users by user email
 */
admin_interface.show_user = async (user_email) => {
    helpers.horizontal_cli_space();
    helpers.create_cli_title(`U S E R  --${user_email}`);
    helpers.horizontal_cli_space();

    try {
        const {password, ...user} = await file_model.read_promise('users', helpers.create_user_id(user_email));
        helpers.create_cli_table(Object.keys(user), [Object.values(user)]);
    } catch (err) {
        helpers.create_cli_centered_message('User was not found');
    }
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

/**
 * Helper function in order to create the orders table
 * 
 * @param orders_names array
 * 
 */
const create_orders_table = async (orders_names = []) => {
    const orders_rows   = [];
    const orders_header = [ 
        'ID',
        'Date',
        'Order Complete',
        'Payment Sum',
        'Order (JSON)',
        'Payment Complete',
        'Email Sent',
        'errors (JSON)'
    ];

    for (const order_name of orders_names) {

        try {

            const {
                id, 
                time,
                order,
                order_complete, 
                email_sent,
                payment_complete,
                payment_sum,
                errors
            } = await file_model.read_promise('orders', order_name);

            const order_row = {
                id: id,
                time: (new Date(time)).toDateString(),
                order_complete: order_complete,
                payment_sum: payment_sum,
                order: JSON.stringify(order),
                payment_complete: payment_complete,
                email_sent: email_sent,
                errors: JSON.stringify(errors)
            }
    
            orders_rows.push(
                Object.values(order_row)
            );

        } catch(err) {
            continue;
        }
    }

    if ( ! orders_rows.length) {
        helpers.create_cli_centered_message('No Results');
        return false;
    }

    helpers.create_cli_table(orders_header, orders_rows);
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