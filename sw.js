/**
 * ========= SERVICE WORKER ========================
 */

let secret;
let broadcast = new BroadcastChannel('fetchChannel');

// Listen to the response
broadcast.onmessage = (event) => {
    console.log(event.data.type);
    switch(event.data.type) { 
      case 'SET': {
        secret = event.data.payload.accessToken;
        console.log('in sw', secret);
        return;
      }
      case 'REMOVE': {
        console.log('being removed');
        secret = undefined;
        return;
      }
      case 'GET': {
        broadcast.postMessage({ token: secret });
        return;
      }
      default: {
        // broadcast.postMessage({ token: secret });
        return;
      }
    }
};

self.addEventListener('install', (event) => {
  console.log('INSTALL');
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
	// const allClients = await clients.matchAll({ includeUncontrolled: true });
	// console.log(allClients);
	if (!secret) {
  	event.waitUntil(clients.claim());
	}
});

self.addEventListener('fetch', async (event) => {
	if (event.request.url.includes('jsonplaceholder.typicode.com')) {
		event.respondWith(fetch(new Request(event.request, { 
                  headers: { 
                    Authorization: `Bearer ${secret}` 
                  }
                })));
	}
});
