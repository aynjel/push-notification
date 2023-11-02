importScripts('../ngsw-worker.js');

self.addEventListener('sync', function(event) {
  if (event.tag == 'post-data') {
    event.waitUntil(addData());
  }
});

function addData(){
    var object = {
        name: 'Test',
        age: 30
    };

    fetch('http://localhost:8050/data', {
        method: 'POST',
        body: JSON.stringify(object),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(function(response) {
        return response.json();
    }).catch(function(error) {
        console.error('Error:', error);
    });
}