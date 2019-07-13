App.orders = () => {
    const order_complete_message = localStorage.getItem('order_complete_message');

    if (order_complete_message) {

        const success_message = {
            title: 'Order has been send successfully',
            type: 'success',
            content: order_complete_message
        }
        App.show_toast(success_message, () => {
            localStorage.removeItem('order_complete_message');
        });
    }
}