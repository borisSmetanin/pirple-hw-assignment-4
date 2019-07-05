/**
 * Container for the server
 * 
 */
let server = {};

// Export the helpers at file start to avoid circular dependencies
module.exports = server;

/**
 * Load Dependencies
 */

// External modules
 let 
    http          = require('http'),
    https         = require('https'),
    fs            = require('fs'),
    path          = require('path'),
    url           = require('url'),
    StringDecoder = require('string_decoder').StringDecoder;

// External modules

let 
    helpers = require('./helpers');

// Define allowed methods for and controllers
server.allowed_controllers_and_methods = {
    users:  [ 'get', 'post_collection', 'put', 'delete' ],
    tokens: [ 'post_collection', 'put', 'delete', 'get' ],
    menu:   [ 'get_collection' ],
    orders: [ 'post_collection', 'get', 'get_collection' ],
};

server.allowed_web_pages_and_methods = {
    home:   [ 'index', 'test' ],
    orders: [ 'view', 'cart'  ],
    user_auth: [ 'logout'     ]
}

// Create the HTTP server
server.http_server = http.createServer((req, res) => {
    server.router(req, res);
});
 
 
// HTTPS server config
server.https_server_options = {
    key: fs.readFileSync(path.join(__dirname, '/../https/key.pem')),
    cert: fs.readFileSync(path.join(__dirname, '/../https/cert.pem'))
};
 
// Create the HTTPS server
server.https_server = https.createServer(server.https_server_options, (req, res) => {
    server.router(req, res);
});

/**
 *  Global request object
 * 
 * */
server.current_request = {};
/**
 * Routes the HTTP requests to the different controllers and methods 
 * 
 * In general this API architecture is build to expect the following url rout schema: 
 * * "HTTP_METHOD <controller>(/<id>)(/<special_action>)". e.g POST /foo/123/check_bar
 * 
 * URL schema breakdown:
 * * <controller>     - mandatory - the controller for a specific api entity (like users) - each controller should have its own file that lives inside controller directory
 * * <id>             - optional  - identifier of a specific entity like user's phone for example - in case the action should be made on a specific item inside the controller
 * * <special_action> - optional  - special action that is more then simple CRUD that should be made on a specific item
 * 
 * The action name will always start with the HTTP method. e.g: GET => get
 * 
 * If no additional url params were given the action will end with "_collection". e.g GET foo/ => foo.get_collection()
 * 
 * if <id> param is given - the action will only have the HTTP name and nothing else. e.g GET foo/123 => foo.get()
 * 
 * if <special_action> is given then action will end with "_<special_action>". e.g: GET foo/123/special => foo.het_special()
 * 
 * Examples:
 * 
 * POST /foo             => Controller: foo, Action: post_collection => foo.post_collection() is executed
 * GET /bar/1234         => Controller: bar, Action: get             => bar.get() is executed
 * PUT /hello/1234/world => Controller: hello, Action: put_hello     => hello.put_world() is executed
 */
server.router= (req, res) => {

    server.current_request = req;
    // Get the URL from the request and parse it
    let 
        parsed_url   = url.parse(req.url, true),
        pathname     = parsed_url.pathname,
        trimmed_path = pathname.replace(/^\/+|\/+$/g, '');
  
    if (trimmed_path) {

        let path_arr = trimmed_path.split('/');

        if (path_arr[0] == 'api') {
            // In of an API - remove the "api" prefix
            server.api_router( path_arr.filter(path => path != 'api'), parsed_url, req, res);
        } else {
            // Request without api prefix  - show regular website pages / assets
            server.website_router(path_arr, parsed_url, req, res)
        }
        
    } else{

        if (req.method.toLowerCase() == 'get') {
            // Regular GET request to the main domain route - show home page
            server.execute_route('home', 'index', {}, res, 'web');
        } else {
            // Denny any non GET request to the main page
            server.execute_route('http_errors', 'not_found_web', {}, res, 'error');
        }
    }
}

/**
 * @param path_arr
 * @param res 
 */
server.api_router = (path_arr, parsed_url, req, res) => {

    if (path_arr.length && path_arr.length <= 3) {

        // Extract the controller
        let 
            controller          = path_arr[0],
            allowed_controllers = Object.keys(server.allowed_controllers_and_methods);
        
            // Validate controller exists
        if (allowed_controllers.indexOf(controller) > -1) {

            let
               // http method will always be the start of each action
                http_method     = req.method.toLowerCase(),
                action          = '',
                allowed_actions = server.allowed_controllers_and_methods[controller],
                id              = null;
            
            // Create the requested action according to the <controller>(/<id>)(/<special_action>) schema logic
            switch (path_arr.length) {
                
                // <special_action> was given - add it at the end of the action name
                case 3:
                    // Set the id
                    id     = path_arr[1];
                    action = `${http_method}_${path_arr[2]}`;
                break;

                // <id> was given - the action is on a single item inside the entity
                case 2:
                    // Set the id
                    id     = path_arr[1];
                    action = http_method;
                break;

                // No extra param were given - the action is on a multiple items inside the entity / action is creating new item in an entity
                default:
                    action = `${http_method}_collection`;
                break;
            }

           if (allowed_actions.indexOf(action) >-1) {

                server.extract_request_payload(req, (payload) => {
                    let request = {
                        query_object: parsed_url.query,
                        headers: req.headers,
                        payload: payload,
                        id: id,
                        // Extract the token out of the headers
                        token: req.headers.authorization 
                            ? req.headers.authorization.replace('Basic ', '') 
                            : null
                    };
                    // Execute the correct action
                    server.execute_route(controller, action, request, res, 'api'); 
                });
            
           } else {
                // Action not found
                server.execute_route('http_errors', 'not_found', {}, res, 'error'); 
           } 

        } else {
            // Controller was not found
            server.execute_route('http_errors', 'not_found', {}, res, 'error');
        }

    } else {
        // API support 3 url params, if more then 3 were given - or if none url params were given (after api..) - denny that
        server.execute_route('http_errors', 'not_found', {}, res, 'error');
    }
}

server.website_router = (path_arr, parsed_url, req, res) => {

    let 
        requested_page = path_arr[0], 
        allowed_pages = Object.keys(server.allowed_web_pages_and_methods);

        if (allowed_pages.includes(requested_page)) {

            let 
                requested_method = path_arr.filter((value, index) =>  index > 0 ).join('_'),
                allowed_methods  = server.allowed_web_pages_and_methods[requested_page];

            if (allowed_methods.includes(requested_method)) {

                server.extract_request_payload(req, (payload) =>{

                    server.execute_route(requested_page, requested_method, payload, res, 'web');
                });
                
            } else {
                server.execute_route('http_errors', 'not_found_web', {}, res, 'error');
            }
        } else {

            if (requested_page == 'assets') {

                server.execute_route(
                    'web_assets', 
                    'fetch_asset', { 
                        asset_file_path: path_arr.filter((value, index) =>  index > 0 ).join('/')
                    }, 
                    res, 
                    'web'
                );
            } else {
                server.execute_route('http_errors', 'not_found_web', { }, res, 'error');
            }
        }
}

// TODO write documentation! !
server.extract_request_payload = (req, callback) => {
    let 
        decoder = new StringDecoder,
        string_payload = '';

    // Get the payload from the request
    req.on('data', (data) => {
        string_payload+= decoder.write(data);
    });

    // Decoder has finished to pass the request payload
    req.on('end', () => {
        string_payload+= decoder.end();
        callback(helpers.paresJsonToObject(string_payload));
    });
}

/**
 * Executes a route according the parameters
 */
server.execute_route = async (controller_name, method, payload, res, scope) => {

    let controller = require(`../controllers/${scope}/${controller_name}`);

    if (Object.keys(server.allowed_web_pages_and_methods).includes(controller_name) && server.current_request.headers.cookie){
        let request_cookies = helpers.parse_request_cookies(server.current_request.headers.cookie);
        // User is logged off by default
        payload.user_is_logged = false;
        // In case we get cookies from website - need to check that they are valid
        if (Object.keys(request_cookies).length > 0 && request_cookies.token && request_cookies.email) {
            payload.user_is_logged = await helpers.verify_token_promise(request_cookies.token, request_cookies.email);
        }

        payload.request_cookies = request_cookies;
    }
    // Execute the action
    controller[method](payload, (http_code, error, payload, response_type, response_cookies) => {

        let response = payload;

        // Prepare global response
        switch (response_type) {
            case 'html':
                    res.setHeader('Content-Type', 'text/html');
            break
            case 'css':
                res.setHeader('Content-Type', 'text/css');
            break
            case 'js':
                res.setHeader('Content-Type', 'text/javascript');
            break
            case 'png':
                res.setHeader('Content-Type', 'image/png');
            break;
            case 'jpg':
                res.setHeader('Content-Type', 'image/jpeg');
            break;
            default:
                // Default JSON response
                res.setHeader('Content-Type', 'application/json');

                response = JSON.stringify({
                    code: http_code,
                    error: error,
                    payload: payload || {}
                })
            break;
        }

        
        // Set cookies
        if (response_cookies && Array.isArray(response_cookies) && response_cookies.length > 0) {

            let all_cookies_arr = [];
            response_cookies.forEach(  cookie => {
               
                let single_cookie_arr = [];
                for (let [key, value] of Object.entries(cookie)) {
                    // Set specific cookie values 
                    single_cookie_arr.push(`${key}=${value}`)
                }
                // Default cookies needs to be set for security reasons
                single_cookie_arr.push(`SameSite=lax`);
                single_cookie_arr.push('HttpOnly');

                all_cookies_arr.push(single_cookie_arr.join(';'));
            });
            res.setHeader('Set-Cookie', all_cookies_arr);
        }

        // Execute the response
        res.statusCode = http_code;
        res.end(response, () => {
            // Set the server.global_request
            server.current_request = {};
        });
    });
}

// server.global_request = {}

// This will start off the servers
server.serve = () => {

    // Start HTTP server
    server.http_server.listen(3000, () => {
        console.log(`http is on`);
    });

    // Start the HTTPS server
    server.https_server.listen(3001, () => {
        console.log(`https is on`);
    });
}