importScripts('./ngsw-worker.js');

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