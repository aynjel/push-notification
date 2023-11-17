self.importScripts('./ngsw-worker.js');

console.log('Service worker loaded!');

// self.addEventListener('sync', function(event) {
//   event.waitUntil(listenNotification());
// });

// function listenNotification() {
//     var res =  fetch('https://chh-push-notification-production.up.railway.app/api/v1/subscribe', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({
//         userId: '123456789123',
//         app: 'doki',
//       }),
//     })
//     res.then(function(res) {
//       res.json()
//     }).then(function(res) {
//       console.log(res);
//       var ws = new WebSocket(res.data.url);

//       ws.onmessage = function(e) {
//         var serverMessage = e.data;
//         console.log(serverMessage);
//         navigator.serviceWorker.ready.then(function(serviceWorker) {
//           serviceWorker.showNotification(serverMessage.title);
//         });
//       };
//     });
// }

// self.addEventListener('push', function(event) {
//   console.log('Push message received', event);
//   if(event.data){
//     var data = event.data.json();
//     event.waitUntil(self.registration.showNotification(
//       data.title,
//       {
//         body: data.body || 'Push message no payload',
//         icon: 'https://cdn-icons-png.flaticon.com/512/8297/8297354.png',
//         tag: 'push-simple-demo-notification-tag',
//       }
//     ));
//   }
// });

// self.addEventListener('sync', function(event) {
//     if (event.tag === 'post-data') {
//         // call method
//         event.waitUntil(getDataAndSend());
//     }
// });
  
// function addData(userName) {
//     //indexDb
//     var obj = {
//       name: userName,
//     };
//     fetch('http://localhost:8050/data', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify(obj),
//     })
//       .then(function() {Promise.resolve()})
//       .catch(function() {Promise.reject()});
//   }
  
  // function getDataAndSend() {
  //   var db;
  //   var request = indexedDB.open('my-db');
  //   request.onerror = function(event) {
  //     console.log('Please allow my web app to use IndexedDB 😃>>>👻');
  //   };
  //   request.onsuccess = function(event) {
  //     db = event.target.result;
  //     getData(db);
  //   };
// }
  
// function getData(db) {
//     var transaction = db.transaction(['user-store']);
//     var objectStore = transaction.objectStore('user-store');
//     var request = objectStore.get('name');
//     request.onerror = function(event) {
//       // Handle errors!
//     };
//     request.onsuccess = function(event) {
//       // Do something with the request.result!
//       addData(request.result);
//       console.log('Name of the user is ' + request.result);
//     };
// }