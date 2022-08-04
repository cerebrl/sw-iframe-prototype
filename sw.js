/**
 * ========= SERVICE WORKER ========================
 */

let secret;
let broadcast = new BroadcastChannel('fetchChannel');

function formEncode(data) {
  const pairs = [];
  for (const k in data) {
    if (data[k]) {
      pairs.push(k + '=' + encodeURIComponent(data[k]));
    }
  }
  return pairs.join('&');
}

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
