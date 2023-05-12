import {
  checkForMissingSlash,
  evaluateUrlForInterception,
  getBodyBlob,
  getEndpointPath,
  getHeaders,
  resolve,
} from './_utils';

// TODO: Figure out how to get this to work with TypeScript
declare const self: any;

export function interceptor(config) {
  /** ****************************************************
   * SERVICE WORKER IMPLEMENTATION
   */
  const fetchEventName = config?.events?.fetch || 'FETCH_RESOURCE';
  const forgerockBaseUrl = checkForMissingSlash(
    config?.forgerock?.serverConfig?.baseUrl
  );
  const realmPath = config?.forgerock?.realmPath || 'root';
  const urls = [
    ...config?.interceptor?.urls,
    // `${resolve(forgerockBaseUrl, getEndpointPath('accessToken', config?.forgerock?.realmPath))}`,
    `${resolve(forgerockBaseUrl, getEndpointPath('revoke', realmPath))}`,
    `${resolve(forgerockBaseUrl, getEndpointPath('userInfo', realmPath))}`,
  ];

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

    if (evaluateUrlForInterception(url, urls)) {
      console.log(`Intercepting ${url}`);

      event.respondWith(
        new Promise(async (resolve, reject) => {
          const app = await self.clients.get(event.clientId);
          const requestCopy = {
            url: request.url,
            options: {
              method: request.method,
              headers: getHeaders(request),
              body: await getBodyBlob(request),
              mode: request.mode,
              credentials: request.credentials,
              cache: request.cache,
              redirect: request.redirect,
              referrer: request.referrer,
              integrity: request.integrity,
            },
          };

          app.postMessage({ type: fetchEventName, request: requestCopy }, [
            proxyChannel.port2,
          ]);
          proxyChannel.port1.onmessage = (messageEvent) => {
            console.log(`Returning ${url}`);
            resolve(new Response(JSON.stringify(messageEvent.data)));
          };
        })
      );
    }
  });
}
