// i will have 
// 1. one main functions container
// 2. app is the only place where functions are executed
// 3. if some pag have specific functions need to be executed - it will happen in the 

const App = {};

App.dialog = (partial_id, dialog_data, dialog_body) => {

    let 
        dialog = Mustache.render(
            document.getElementById(partial_id).innerHTML, dialog_data, {
                dialog_body: dialog_body
            }
        ),
        // Create Jquery object - needed for BT
        $jq_dialog = $(dialog);

    // Fire the dialog (JQuery style)
    $jq_dialog.modal('show');

    // After model is shown - append the callbacks
    $jq_dialog.on('shown.bs.modal', () => {

        // Extract the content element
        let model_content_elm = $jq_dialog[0].getElementsByClassName('modal-content')[0];
    
        // Loop on each given btn and apply a callback when it clicks
        if (dialog_data && dialog_data.buttons) {
            dialog_data.buttons.forEach( button => {
                let dialog_button = document.getElementsByClassName(`dialog-callback-${button.name}`)[0];
                dialog_button.addEventListener('click', (e) => {
                    button.callback(model_content_elm, e);
                });
            });
        }
    });

    // Destroy the dialog once it is closed - we will create a new dialog each time!!!!
    $jq_dialog.on('hidden.bs.modal',  () => {
        $jq_dialog.modal('dispose');
        $jq_dialog.remove();
    });
}

App.show_toast = (toast_data, callback) => {

    let toast_html = Mustache.render(
        document.getElementById('toast_partial').innerHTML, 
        toast_data
    );

    let $toast_html = $(toast_html);
    $('body').find('#toast-messages-container').append($toast_html);

    $toast_html.toast('show');

    $toast_html.on('hidden.bs.toast', () => {
        $toast_html.remove();

        if (callback && typeof callback == 'function') {
            callback();
        }
    })
}

App.serialize_form = (form_elem) => {
   let serialized_form = {};
    Array.from(form_elem.getElementsByTagName('input')).forEach(input => {
        serialized_form[input.name] = input.value;
    });

    return serialized_form;
}

App.send_ajax_request = (end_point, http_type, request_body) => {

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
            typeof request_body === 'object' && Object.entries(request_body).length > 0
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

App.register_dialog = () => {
   App.dialog(
        'dialog_partial', {
            title: 'Register',
            buttons: [
                {
                    class: 'btn-success',
                    name: 'submit',
                    title: 'Submit',
                    callback:  async (model_content, event) => {
                        let 
                            form            = model_content.getElementsByTagName('form')[0],
                            serialized_form = App.serialize_form(form);

                        try {
                            let 
                                registered_user     = await App.send_ajax_request('api/users', 'POST', serialized_form),
                                { email, password } = serialized_form,
                                token               = await App.send_ajax_request('api/tokens', 'POST', {
                                    email:email,
                                    password: password
                                });

                                location.reload();


                        } catch (error) {

                            App.show_toast({
                                title: 'Problem in registration:',
                                type: 'danger',
                                content: error.message,
                                always_show: true
                            });
                        }
                    }
                }
            ]
        },  
        document.getElementById('register_partial').innerHTML
   );
}


App.login_dialog = () => {

    App.dialog(
        'dialog_partial', {
            title: 'Login',
            buttons: [
                {
                    class: 'btn-success',
                    name: 'submit',
                    title: 'Submit',
                    callback:  async (model_content, event) => {
                        let 
                            form            = model_content.getElementsByTagName('form')[0],
                            serialized_form = App.serialize_form(form);

                        try {
                                await App.send_ajax_request('api/tokens', 'POST', serialized_form);
                                location.reload();
                        } catch (error) {

                            App.show_toast({
                                title: 'Problem in login:',
                                type: 'danger',
                                content: error.message,
                                always_show: true
                            });
                        }
                    }
                }
            ]
        },  
        document.getElementById('login_partial').innerHTML
    );
}

App.logout = async () => {

    // No matter what, after logout request, even if it fails - need to go back to the home page
    await App.send_ajax_request('user/logout', 'GET');

    location.href = BASE_URL;
}

App.user_logged_in = () => {
    const logout = document.getElementsByClassName('logout');

    logout[0].addEventListener('click', (e) => {
        e.preventDefault();
        App.logout();
    });
}

App.user_logged_out = () => {

    //-- Define Variables -------------------------------------------------------------//
    const 
        registration_dialog = document.getElementsByClassName('management-dialog'),
        login_dialog        = document.getElementsByClassName('login-dialog');

    //-- Events -----------------------------------------------------------------------//

    registration_dialog[0].addEventListener('click', (e) => {
        e.preventDefault();
        App.register_dialog();
    });

    login_dialog[0].addEventListener('click', (e) => {
        e.preventDefault();
        App.login_dialog();
    });   
}

App.update_shopping_cart_items_count = () => {

    const current_order_json = localStorage.getItem('current_order');

    if (current_order_json) {
        const 
            pizza_shopping_cart = document.getElementsByClassName('pizza-shopping-cart');
            current_order       = JSON.parse(current_order_json),
            { total_items }     = current_order;

        pizza_shopping_cart[0].innerHTML =  total_items;
    }
}

// Define all events listener and all functions that are going to be executed on page load 
App.execute = () => {
    
    App.update_shopping_cart_items_count();
    // Different logic according to different state
    if (USER_IS_LOGGED) {
        App.user_logged_in();
    } else {
        App.user_logged_out();
    }
}
// Execute
App.execute();





