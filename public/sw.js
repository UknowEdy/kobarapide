// This service worker runs in the background to handle notifications.

// Event listener for when a user clicks on a notification.
self.addEventListener('notificationclick', (event) => {
  // Close the notification pop-up.
  event.notification.close();

  // Open the app's window or focus on it if it's already open.
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's an open window, focus on the most recently focused one.
      if (clientList.length > 0) {
        let client = clientList[0];
        for (let i = 0; i < clientList.length; i++) {
          if (clientList[i].focused) {
            client = clientList[i];
          }
        }
        return client.focus();
      }
      // If no window is open, open a new one.
      return clients.openWindow('/');
    })
  );
});
