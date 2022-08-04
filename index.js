/**
 * ========= CONFIGURING THE SDK & LOGIN ============
 */

import Config from './sdk/config/index.js';
import TokenManager from './sdk/token-manager/index.js';
// import UserManager from './sdk/user-manager/index.js';

const broadcast = new BroadcastChannel('fetchChannel');

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
			return undefined;
		},
		async remove(clientId) {
			return undefined;
		},
		async set(clientId, tokens) {
                  broadcast.postMessage({ type: 'SET',  payload: tokens })
		  return undefined;
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

const showUser = (user) => {
  document.querySelector('#User pre').innerHTML = JSON.stringify(user, null, 2);
  const panel = document.querySelector('#User');
  panel.querySelector('.btn').addEventListener('click', () => {
    logout();
  });
  showStep('User');
};

const authorize = async (code, state) => {
  /**
   *  When the user return to this app after successfully logging in,
   * the URL will include code and state query parameters that need to
   * be passed in to complete the OAuth flow giving the user access
   */
  await TokenManager.getTokens({ query: { code, state } });
  // const user = await UserManager.getCurrentUser();
  // showUser(user);
};

document.querySelector('#loginBtn').addEventListener('click', async () => {
  /**
   * The key-value of `login: redirect` is what allows central-login.
   * Passing no arguments or a key-value of `login: 'embedded'` means
   * the app handles authentication locally.
   */
  await TokenManager.getTokens({ login: 'redirect' });
  // const user = await UserManager.getCurrentUser();
  // showUser(user);
});

// document.querySelector('#forceRenewBtn').addEventListener('click', async () => {
//   // });

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
const renewBtn = document.getElementById('renewBtn')

broadcast.onmessage = (event) => {
	console.log('on message received', event.data);
};

fetchBtn.addEventListener('click', async (e) => {
  await fetch('https://jsonplaceholder.typicode.com/todos');
});

secretForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const secret = event.target.children[1].value;
  broadcast.postMessage({ type: 'SET', payload: secret });
});

renewBtn.addEventListener('click', async (e) => {
  broadcast.postMessage({ type: 'REMOVE' });
  await TokenManager.getTokens({ login: 'redirect', forceRenew: true });
  // const user = await UserManager.getCurrentUser();
  // showUser(user);
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
