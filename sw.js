/**
 * ========= SERVICE WORKER ========================
 */

let secret;
let broadcast = new BroadcastChannel('fetchChannel');

// Listen to the response
broadcast.onmessage = (event) => {
	secret = event.data;
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
		event.respondWith(new Response(`{ message: ${secret} }`));
	}
});
