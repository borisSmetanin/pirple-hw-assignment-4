const orders = {};

module.exports = orders;

orders.create = (payload, callback) => {

    callback(200, false, '<h1>create an order page</h1>', 'html');
}