type ClientConfig = {
  events?: {
    fetch?: string;
    has?: string;
    refresh?: string;
    remove?: string;
    set?: string;
  };
  forgerock: {
    clientId: string;
  };
  interceptor?: {
    file?: string;
    type?: string;
  };
  proxy?: {
    id?: string;
    origin: string;
    url?: string;
  };
};


/**
 * @function client - Initialize the token vault client
 *
 * @param {Object} config
 *
 * @returns {undefined}
 */
export function client(config: ClientConfig) {
  let tokenVaultProxyEl;

  return {
    interceptor: async function (options) {
      /** ****************************************************
       * SERVICE WORKER REGISTRATION
       */
      const filename = options?.file || config?.interceptor?.file;
      const moduleType = options?.type || config?.interceptor?.type || 'module';

      const registerServiceWorker = async () => {
        if ('serviceWorker' in navigator) {
          try {
            return navigator.serviceWorker.register(filename, {
              type: moduleType,
            });
          } catch (error) {
            console.error(
              `Token Vault Interceptor (Service Worker) registration failed with ${error}`
            );
          }
        }
      };

      return await registerServiceWorker();
    },
    proxy: function (target, options) {
      /** ****************************************************
       * IFRAME HTTP PROXY SETUP
       */
      const fetchEventName = config?.events?.fetch || 'FETCH_RESOURCE';
      const frameId = options?.id || config?.proxy?.id || 'token-vault-iframe';
      const proxyOrigin =
        options?.origin || config?.proxy?.origin || 'http://localhost:9000';
      const proxyUrl =
        options?.url || config?.proxy?.url || 'http://localhost:9000';

      const fragment = document.createElement('iframe');
      fragment.setAttribute('id', frameId);
      fragment.setAttribute('src', proxyUrl);
      fragment.setAttribute('style', 'display: none');

      tokenVaultProxyEl = target.appendChild(fragment);

      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data?.type === fetchEventName) {
          tokenVaultProxyEl.contentWindow.postMessage(
            { type: fetchEventName, request: event.data.request },
            proxyOrigin,
            [event.ports[0]]
          );
        }
      });

      return tokenVaultProxyEl;
    },
    store: function (options) {
      const clientId = config?.forgerock?.clientId || 'WebOAuthClient';
      const hasTokenEventName = config?.events?.has || 'HAS_TOKENS';
      const refreshTokenEventName =
        config?.events?.refresh || 'REFRESH_TOKENS';
      const removeTokenEventName =
        config?.events?.remove || 'REMOVE_TOKENS';
      const setTokenEventName = config?.events?.set || 'SET_TOKENS';

      return {
        get() {
          // We cannot get the tokens out of the iframe
          return null;
        },
        has() {
          const proxyChannel = new MessageChannel();

          return new Promise((resolve, reject) => {
            tokenVaultProxyEl.contentWindow.postMessage(
              { type: hasTokenEventName, clientId },
              options?.proxy?.origin || config?.proxy?.origin,
              [proxyChannel.port2]
            );
            proxyChannel.port1.onmessage = (event) => {
              resolve(event.data);
            };
          });
        },
        refresh() {
          const proxyChannel = new MessageChannel();

          return new Promise((resolve, reject) => {
            tokenVaultProxyEl.contentWindow.postMessage(
              { type: refreshTokenEventName, clientId },
              options?.proxy?.origin || config?.proxy?.origin,
              [proxyChannel.port2]
            );
            proxyChannel.port1.onmessage = (event) => {
              resolve(event.data);
            };
          });
        },
        remove(clientId) {
          const proxyChannel = new MessageChannel();

          return new Promise((resolve, reject) => {
            tokenVaultProxyEl.contentWindow.postMessage(
              { type: removeTokenEventName, clientId },
              options?.proxy?.origin || config?.proxy?.origin,
              [proxyChannel.port2]
            );
            proxyChannel.port1.onmessage = (event) => {
              resolve(event.data);
            };
          });
        },
        set(clientId, tokens) {
          const proxyChannel = new MessageChannel();

          return new Promise((resolve, reject) => {
            tokenVaultProxyEl.contentWindow.postMessage(
              { type: setTokenEventName, clientId, tokens },
              options?.proxy?.origin || config?.proxy?.origin,
              [proxyChannel.port2]
            );
            proxyChannel.port1.onmessage = (event) => {
              resolve(event.data);
            };
          });
        },
      };
    },
  };
}
