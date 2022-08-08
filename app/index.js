/** ****************************************************
 * SERVICE WORKER REGISTRATION
 */

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      navigator.serviceWorker.register('sw.js', { type: 'module' });
    } catch (error) {
      console.error(`SW registration failed with ${error}`);
    }
  }
};

registerServiceWorker();

/** ****************************************************
 * IFRAME HTTP PROXY SETUP
 */

const identityProxyFrame = document.getElementById('identityProxyFrame');

navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data?.type === 'FETCH_RESOURCE') {
    identityProxyFrame.contentWindow.postMessage(
      { type: 'FETCH_RESOURCE', request: event.data.request },
      '*',
      [event.ports[0]]
    );
  }
});

/** ****************************************************
 * SDK CONFIGURATION
 */

import Config from './sdk/config/index.js';
import FRUser from './sdk/fr-user/index.js';
import TokenManager from './sdk/token-manager/index.js';
import UserManager from './sdk/user-manager/index.js';

Config.set({
  clientId: 'WebOAuthClient',
  redirectUri: `${window.location.origin}`,
  scope: 'openid profile me.read',
  serverConfig: {
    baseUrl: 'https://openam-crbrl-01.forgeblocks.com/am',
    timeout: 3000,
  },
  realmPath: 'alpha',
  tokenStore: {
    get(clientId) {
      // We cannot get the tokens out of the iframe
      // Currently we need to return an empty object so SDK methods don't crash
      return {};
    },
    remove(clientId) {
      const proxyChannel = new MessageChannel();

      return new Promise((resolve, reject) => {
        identityProxyFrame.contentWindow.postMessage(
          { type: 'REMOVE_TOKENS', clientId },
          '*',
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
        identityProxyFrame.contentWindow.postMessage(
          { type: 'SET_TOKENS', clientId, tokens },
          '*',
          [proxyChannel.port2]
        );
        proxyChannel.port1.onmessage = (event) => {
          resolve(event.data);
        };
      });
    },
  },
});

 /** ****************************************************
  * ATTACH USER EVENT LISTENERS
  */

const fetchMockBtn = document.getElementById('fetchMockBtn');
const fetchUserBtn = document.getElementById('fetchUserBtn');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');

fetchMockBtn.addEventListener('click', async (event) => {
  await fetch('https://jsonplaceholder.typicode.com/todos');
});
fetchUserBtn.addEventListener('click', async (event) => {
  const user = await UserManager.getCurrentUser();

  // Log the user information to console to observe final result
  console.log(user);
});
loginBtn.addEventListener('click', async (event) => {
  await TokenManager.getTokens({ login: 'redirect', forceRenew: true });
});
logoutBtn.addEventListener('click', async (event) => {
  // Not all endpoints are supported and will fail
  FRUser.logout();
});

 /** ****************************************************
  * CENTRAL LOGIN REDIRECT HANDLER
  */

 /**
  * Check URL for query parameters
  */
const url = new URL(document.location);
const params = url.searchParams;
const code = params.get('code');
const state = params.get('state');

/**
* If the URL has state and code as query parameters, then the user
* returned back here after successfully logging, so call authorize with
* the values
*/
if (state && code) {
  await TokenManager.getTokens({ query: { code, state } });
  location.replace('http://localhost:8000');
}
