App.home = () => {
    const pizza_items_container = document.getElementById('pizza-items-container');
    
    // Listen to any clicks on the items container
    pizza_items_container.addEventListener('click', (e) => {
    
        // Extract the target out of the event
        const { target }  = e;
        const clicked_elm = target.closest('.add-to-cart');
    
        // Add to cart is clicked
        if (clicked_elm && pizza_items_container.contains(clicked_elm)) {
    
            const 
                { name }           = clicked_elm.dataset,
                current_order_json = localStorage.getItem('current_order'),
                current_order      = current_order_json ? JSON.parse(current_order_json) : { total_items: 0 }; 
    
            if ( ! current_order[name] ) {
                current_order[name] = 0;
            }
    
            // update counts
            current_order[name]+=1 ;
            current_order.total_items+=1;
            
            // Save data to the local storage
            localStorage.setItem('current_order', JSON.stringify(current_order));

            // Update the shopping cart total items count
            App.update_shopping_cart_items_count();
        }
    });
}