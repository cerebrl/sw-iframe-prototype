/**
 * ========= CONFIGURING THE SDK & LOGIN ============
 */

import Config from './sdk/config/index.js';
import TokenManager from './sdk/token-manager/index.js';
// import UserManager from './sdk/user-manager/index.js';

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
		async get(clientId) {
			const promise = new Promise();
			return promise.resolve();
		},
		async remove(clientId) {
			const promise = new Promise();
			return promise.resolve();
		},
		async set(clientId, tokens) {
      console.log(tokens);
			const promise = new Promise();
			return promise.resolve();
		}
	}
});

const logout = async () => {
  try {
    await forgerock.FRUser.logout();
    location.assign(`${document.location.origin}/`);
  } catch (error) {
    console.error(error);
  }
};

const authorize = async (code, state) => {
  /**
   *  When the user return to this app after successfully logging in,
   * the URL will include code and state query parameters that need to
   * be passed in to complete the OAuth flow giving the user access
   */
  await TokenManager.getTokens({ query: { code, state } });
  // const user = await UserManager.getCurrentUser();
  showUser(user);
};

document.querySelector('#loginBtn').addEventListener('click', async () => {
  /**
   * The key-value of `login: redirect` is what allows central-login.
   * Passing no arguments or a key-value of `login: 'embedded'` means
   * the app handles authentication locally.
   */
  await TokenManager.getTokens({ login: 'redirect' });
  // const user = await UserManager.getCurrentUser();
  showUser(user);
});

// document.querySelector('#forceRenewBtn').addEventListener('click', async () => {
//   await TokenManager.getTokens({ login: 'redirect', forceRenew: true });
//   const user = await UserManager.getCurrentUser();
//   showUser(user);
// });

/**
 * Check URL for query parameters
 */
 const url = new URL(document.location);
 const params = url.searchParams;
 const authCode = params.get('code');
 const state = params.get('state');

/**
 * If the URL has state and authCode as query parameters, then the user
 * returned back here after successfully logging, so call authorize with
 * the values
 */
 if (state && authCode) {
  authorize(authCode, state);
}

/**
 * ========= SW & LISTENER REGISTRATION ============
 */

const secretForm = document.getElementById('secretForm');
const fetchBtn  = document.getElementById('fetchData');
const broadcast = new BroadcastChannel('fetchChannel');

broadcast.onmessage = (event) => {
	console.log(event.data);
};

fetchBtn.addEventListener('click', async (e) => {
  await fetch('https://jsonplaceholder.typicode.com/todos');
});

secretForm.addEventListener('submit', (event) => {
  event.preventDefault();
	const secret = event.target.children[1].value;
  broadcast.postMessage(secret);
});

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
