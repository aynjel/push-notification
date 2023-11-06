importScripts('./ngsw-worker.js');

self.addEventListener('install', function(event) {
    console.log('Service worker installing...');
    // Add a call to skipWaiting here
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    console.log('Service worker activating...');
});

self.addEventListener('fetch', function(event) {
    console.log('Fetching:', event.request.url);
});

self.addEventListener('push', function(event) {
    console.log('Push message received', event);
    var title = 'Push message';
    event.waitUntil(
        self.registration.showNotification(title, {
            body: 'The Message',
            icon: 'images/icon.png',
            tag: 'my-tag'
        }));
});

self.addEventListener('sync', function(event) {
    if (event.tag === 'post-data') {
        // call method
        event.waitUntil(getDataAndSend());
    }
});
  
function addData(userName) {
    //indexDb
    var obj = {
      name: userName,
    };
    fetch('http://localhost:8050/data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(obj),
    })
      .then(function() {Promise.resolve()})
      .catch(function() {Promise.reject()});
  }
  
  function getDataAndSend() {
    var db;
    var request = indexedDB.open('my-db');
    request.onerror = function(event) {
      console.log('Please allow my web app to use IndexedDB 😃>>>👻');
    };
    request.onsuccess = function(event) {
      db = event.target.result;
      getData(db);
    };
}
  
function getData(db) {
    var transaction = db.transaction(['user-store']);
    var objectStore = transaction.objectStore('user-store');
    var request = objectStore.get('name');
    request.onerror = function(event) {
      // Handle errors!
    };
    request.onsuccess = function(event) {
      // Do something with the request.result!
      addData(request.result);
      console.log('Name of the user is ' + request.result);
    };
}