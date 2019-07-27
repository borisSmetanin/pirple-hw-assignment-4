
App.update_user_settings = async (settings_form) => {

    const new_settings = App.serialize_form(settings_form);

    try {
        let user_update_response = await App.send_ajax_request(`api/users/${USER_EMAIL}`, 'PUT', new_settings);

        App.show_toast({
            title: 'Settings were updated',
            type: 'success',
            content: 'Your settings were successfully updated.',
        });
       
    } catch (error) {
        App.show_toast({
            title: 'Problem updating your settings',
            type: 'danger',
            content: error.message,
            always_show: true
        });
    }
}

App.delete_user_dialog = () => {

    App.dialog(
        'dialog_partial', {
            title: 'Deleting Account',
            buttons: [
                {
                    class: 'btn-danger',
                    name: 'submit',
                    title: 'Yes, delete the account',
                    callback:  async (model_content, event) => {

                        try{

                            let deleted_account_response = await App.send_ajax_request(`api/users/${USER_EMAIL}`, 'DELETE');
                            App.logout();
                        } catch(e) {
                            App.show_toast({
                                title: 'Problem deleting your account',
                                type: 'danger',
                                content: error.message,
                                always_show: true
                            });
                        }
                    }
                }
            ]
        },
        `Are you sure you want to delete you'r account?`
    );
}

App.user_settings = () => {
    const settings_form = document.getElementById('main-settings-form');
    const delete_user_form = document.getElementById('delete-user-form');
    
    settings_form.addEventListener('submit', (e)=>{
        e.preventDefault();
        App.update_user_settings(settings_form);
    });

    delete_user_form.addEventListener('submit', (e) => {
        e.preventDefault();
        App.delete_user_dialog();
    });
}