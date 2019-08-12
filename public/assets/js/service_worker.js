// This is the service worker file
// We use it in order to send push notification from server whenever pizza is ready
console.log('Service worker Is loaded');

// Push notification has come from the world
// ==================================================================================================================================
// == FYI `self` in a service worker refers to the service worker interface, e.g thi is how i can use the service worker abilities ==
// ================================================================================================================================== 
//the flow is as followed:
// 1. push was sent from the server to the browser push subscription
// 2. each browser has its own push subscription center (real world HTTP server) which can identifies the user that has send the push
// 3. the browser subscription expects to have valid `vapid` key (NPM webpush package) and a valid user identifier
// 4. in case all is good, the browser subscription center` will return the push to the browser, in an unknown time
// 5. once push is received back in the browser - the `push` event is been triggered in the service worker
self.addEventListener('push', e => {
  // e.data is basically the original push data that was sent from the server
  // push is using the fetch API, which has special property called Body
  // Body is a Mixin type of property, which means that some of the properties are allowed to be implemented by the callbacks
  // This allows us to use the inner `json()` function to make the push data into a json
  const data = e.data.json();
  console.log('push has been received');

  // Show the push to the user
  self.registration.showNotification(
      // First param is the title 
      data.title, 
      // The second param is different options
      {
        // Main content
        body: data.content,
        // Main icon
        icon: data.icon,
        // different actions, e.g special buttons that are located on the push
        actions: [
          {
            // This will tell the `notificationclick` event what action btn was clicked
            action: 'explore', 
            title: 'See Your order',
            // icons are only images (shamefully..)
            icon: 'https://cdn.pixabay.com/photo/2016/03/31/14/37/check-mark-1292787__340.png'
          },
          {
            action: 'close', 
            title: 'Close notification',
            icon: 'https://enphase.com/sites/default/files/content/Xmark_0.png'
          },
        ]
      }
  );
});

// Event for When clicking the notification
self.addEventListener('notificationclick', (e) => {
  const notification = e.notification;
  const action       = e.action;

  // Different action according to the `action` name
  if (action === 'close') {
    notification.close();
  } else {

    // This will take the user to the orders view 
    // Special API that will take the user to the specific page in a new window
    clients.openWindow('http://localhost:3000/orders/view');
    notification.close();
  }
});