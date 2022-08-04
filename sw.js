/** ****************************************************
 * SERVICE WORKER IMPLEMENTATION
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
    default: {
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
          headers: new Headers({
            ...event.request.headers,
            Authorization: `Bearer ${secret}`,
          }),
        })
      )
    );
  } else if (url.includes('token/revoke')) {
    const body = await event.request.text()
    event.respondWith(
      fetch(
        new Request(event.request, {
          body: `${body}&token=${secret}`,
        }),
      )
    );
  }
});
