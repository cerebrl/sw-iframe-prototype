/** ****************************************************
 * SERVICE WORKER IMPLEMENTATION
 */

async function getBody(request) {
  // Return undefined early if GET or HEAD
  if (['GET', 'HEAD'].includes(request.method)) {
    return;
  }

  const blob = await request.clone().blob();

  if (blob && blob.size) {
    return blob;
  }
}
function getHeaders(request) {
  return Array.from(request.headers.keys()).reduce(
    (acc, key) => {
      acc[key] = request.headers.get(key);
      return acc;
    },
    {}
  );
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', async (event) => {
  let proxyChannel = new MessageChannel();
  const url = event.request.url;
  const request = event.request;

  if (
    url.includes('jsonplaceholder.typicode.com') ||
    url.includes('userinfo') ||
    url.includes('token/revoke')
  ) {
    const requestCopy = {
      url: request.url,
      options: {
        method: request.method,
        headers: getHeaders(request),
        body: await getBody(request),
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        referrer: request.referrer,
        integrity: request.integrity,
      },
    };

    event.respondWith(
      new Promise(async (resolve, reject) => {
        const app = await clients.get(event.clientId);
        app.postMessage({ type: 'FETCH_RESOURCE', request: requestCopy }, [
          proxyChannel.port2,
        ]);
        proxyChannel.port1.onmessage = (messageEvent) => {
          resolve(new Response(JSON.stringify(messageEvent.data)));
        };
      })
    );
  }
});
