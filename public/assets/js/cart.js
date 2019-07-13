/**
 * Extracts local storage cart data and reorganize it so it will be easier to use
 * 
 * @param callback
 */
App.extract_cart_data_from_local_storage = (callback) => {

    const 
        current_order_json = localStorage.getItem('current_order'),
        current_order    = JSON.parse(current_order_json ? current_order_json : '{}'),
        cart_items       = [],
        menu_item_names = Object.keys(MENU_ITEMS);

    let total_sum = 0;

    for (let order_item_name in current_order) {

        if (menu_item_names.includes(order_item_name)) {
            const 
                menu_item = MENU_ITEMS[order_item_name],
                item_sum  = menu_item.price * current_order[order_item_name],
                item      = {
                    title: menu_item.title,
                    name: order_item_name,
                    amount: current_order[order_item_name],
                    price: menu_item.price,
                    sum: item_sum
                };    

            cart_items.push(item);
            total_sum+=item_sum;
        }
    }

    if (callback && typeof callback == 'function') {
        callback(total_sum, cart_items, current_order);
    }
}

App.complete_payment_dialog = () => {

    App.dialog(
        'dialog_partial', 
        {
             title: 'Complete your order',
             buttons: [{
                class: 'btn-success',
                name: 'submit',
                title: 'Submit',
                callback:  async (model_content, event) => {
                    let 
                        form            = model_content.getElementsByTagName('form')[0],
                        serialized_form = App.serialize_form(form);
                        current_order_json = localStorage.getItem('current_order'),
                        current_order    = JSON.parse(current_order_json ? current_order_json : '{}');

                        // Remove unneeded field 
                        ({total_items, ...current_order} = current_order);

                        // Disable the submit and add spinner
                        event.target.setAttribute('disabled', true);
                        event.target.insertAdjacentHTML('afterbegin',`<i class="fa fa-spinner fa-spin"></i> `);
                        
                   try {

                       const result = await App.send_ajax_request('api/orders', 'POST',   {
                           order: current_order,
                           credit_card: serialized_form.credit_card
                       });

                       // Set success message 
                       localStorage.setItem('order_complete_message',result.payload.message);

                       // Clear the last order
                       localStorage.removeItem('current_order');

                       // Relocate to completed orders page
                        window.location = `${BASE_URL}orders/view`;

                   } catch(e) {
                       // Remove Spinner and enable the submit button
                        event.target.removeAttribute('disabled');
                        event.target.getElementsByClassName('fa-spinner')[0].remove();
                        // Show the errors
                        App.show_toast({
                            title: 'We had problem completing your order:',
                            type: 'danger',
                            content: e.message,
                            always_show: true
                        });
                   }
                }
             }]
        },
        document.getElementById('complete_payment_partial').innerHTML
    );
}

App.cart = () => {

    const 
        order_cart_table   = document.getElementById('order-cart'),
        payment_container  = document.getElementById('payment-container');

    // Extract local storage data and add to cart if needed
    App.extract_cart_data_from_local_storage( (total_sum, cart_items) => {

        // Populate cart table only if there is something in the cart
        if (total_sum > 0) {

            // Insert cart data to the table UI
            order_cart_table.getElementsByTagName('tbody')[0].innerHTML = Mustache.render(
                document.getElementById('cart_partial').innerHTML, 
                { cart_items: cart_items }
            );
    
            // Show the complete order part
            payment_container.classList.remove('d-none');
    
            // Update the total sum
            payment_container.getElementsByClassName('total-sum')[0].innerHTML = total_sum;
        }
    });

    // Pressing complete payment btn
    payment_container.addEventListener('submit', (e) => {
        e.preventDefault();
        App.complete_payment_dialog();
    });

    // Add/subtract single cart item
    order_cart_table.addEventListener('click', (e) => {

        const { target }  = e;
        const clicked_elm = target.closest('.update-existing-cart-item');

        if (clicked_elm && order_cart_table.contains(clicked_elm)) {
            const { name, update_type } = clicked_elm.dataset;

            App.extract_cart_data_from_local_storage( (total_sum, cart_items, current_order) => {

                let current_item_count  = current_order[name];
                let total_items = current_order.total_items;
                const item_price        = MENU_ITEMS[name].price;
                const item_row          =  clicked_elm.closest(`.${name}-container`);
            
                if (update_type === 'add') {
    
                    current_item_count+=1;
                    total_items+=1;
                    total_sum+=item_price;
                } else {
                    current_item_count-=1;
                    total_items-=1;
                    total_sum-=item_price;
                }
    
                if (current_item_count=== 0) {
                    return false;
                } 

                // Update HTML counts and sums
                item_row.getElementsByClassName('item-amount')[0].innerHTML = current_item_count;
                item_row.getElementsByClassName('item-sum')[0].innerHTML = current_item_count * item_price;
                payment_container.getElementsByClassName('total-sum')[0].innerHTML = total_sum;

                // Update the current cart
                current_order[name]        = current_item_count;
                current_order.total_items = total_items

                // Update local storage
                localStorage.setItem('current_order', JSON.stringify(current_order));

                // Update cart
                App.update_shopping_cart_items_count();
            });
        }
    });
}