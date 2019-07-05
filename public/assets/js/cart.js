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
                item_sum  = menu_item.price * current_order[order_item_name];

            cart_items.push({
                title: menu_item.title,
                amount: current_order[order_item_name],
                price: menu_item.price,
                sum: item_sum
            });
            total_sum+=item_sum;
        }
    }

    if (callback && typeof callback == 'function') {
        callback(total_sum, cart_items);
    }
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
}