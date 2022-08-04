/**
 * ========= SERVICE WORKER ========================
 */

let secret;
let broadcast = new BroadcastChannel('fetchChannel');

// Listen to the response
broadcast.onmessage = (event) => {
  console.log(event.data.type);
  switch (event.data.type) {
    case 'SET': {
      secret = event.data.payload.accessToken;
      return;
    }
    case 'REMOVE': {
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
  self.skipWaiting();
});

self.addEventListener('activate', async (event) => {
  if (!secret) {
    event.waitUntil(clients.claim());
  }
});

self.addEventListener('fetch', async (event) => {
  const url = event.request.url;
  if (
    url.includes('jsonplaceholder.typicode.com') ||
    url.includes('userinfo')
  ) {
    event.respondWith(
      fetch(
        new Request(event.request, {
          headers: {
            ...event.request.headers,
            Authorization: `Bearer ${secret}`,
          },
        })
      )
    );
  }
});
