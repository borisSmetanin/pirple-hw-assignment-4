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
    
        // Loop on eqach given btn and apply a callback when it clicks
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

App.serialize_form = (form_elem) => {
   let serialized_form = {};
    Array.from(form_elem.getElementsByTagName('input')).forEach(input => {
        serialized_form[input.name] = input.value;
    });

    return serialized_form;
}

App.send_ajax_request = (end_point, http_type, request_body) => {

    return fetch(
            `${BASE_URL}${end_point}`,
            {
                method: http_type,
                cache: 'no-cache',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                redirect: 'follow', // manual, *follow, error
                referrer: 'no-referrer', // no-referrer, *client
                body: JSON.stringify(request_body),
            }
        )
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

                            alert(error.message);
                        }
                    }
                }
            ]
        },  
        document.getElementById('register_partial').innerHTML
   );
}

// Define which function are going to be executed
App.execute = () => {
    const management_dialog = document.getElementsByClassName('management-dialog')

    management_dialog[0].addEventListener('click', (e) => {
        e.preventDefault();
        App.register_dialog();
    });
}

// Execute
App.execute();





