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
  self.skipWaiting();
});

self.addEventListener('fetch', async (event) => {
	if (event.request.url.includes('sw.js')) {
		event.respondWith(new Response(`{ message: ${secret} }`));
	}
});
