const BASE_URL = 'http://localhost:3000/';
const send_ajax_request = (end_point, http_type, request_body) => {

    const request_payload = {
        method: http_type,
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        redirect: 'follow', // manual, *follow, error
        referrer: 'no-referrer', // no-referrer, *client
    };
    
    if (http_type !== 'GET') {
        request_payload.body = JSON.stringify(
            ['object', 'subscription'].includes( typeof request_body)
                ? request_body
                : {}
        );
    }

    return fetch(`${BASE_URL}${end_point}`,request_payload)
        .then(response => response.json())
        .then(server_json_response => {
            if (server_json_response && server_json_response.error) {
                throw new Error(
                    server_json_response.payload && server_json_response.payload.message
                        ? server_json_response.payload.message
                        : 'Unexpected error from the server'
                );
            }

            return server_json_response;
        });
}
// This is the main function of the worker
// It is getting messages from the main js scop
// My logic is to execute inner functions according to the different messages
onmessage = (e) => {

    switch (e.data.action) {
        case 'start_keeping_user_logged': 
            keep_user_logged()
        break;
        case 'stop_keeping_user_logged':
                //clear_user_logged_interval();
            break;

    }
}

// Time interval container
let keep_user_logged_interval = null;

// Time interval function to update the user's token, there by extending his login whenever he is logged
const keep_user_logged =() => {
  
    // Extend the token every 10 sec
    keep_user_logged_interval = setInterval(async () => {

        let error = null;
        try {
            const res = await send_ajax_request('api/tokens/update', 'PUT', {});
        } catch(e) {
            error = e;
        }
        postMessage({ worker_type: 'update_login', error: error});
    }, 600000);
  
}
  
// Clear token extend function time interval
const clear_user_logged_interval = () => {
  
    clearInterval(keep_user_logged_interval)
}