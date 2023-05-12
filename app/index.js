/** ***************************************************
 * TOKEN VAULT CLIENT CONFIGURATION
 */

import { client } from '../token-vault';

// Initialize the token vault client
const register = client({
  events: {
    // fetch: 'FETCH_RESOURCE',
    // remove: 'REMOVE_TOKENS',
    // set: 'SET_TOKENS',
  },
  interceptor: {
    file: 'interceptor.js',
    type: 'module',
  },
  proxy: {
    origin: 'http://localhost:9000',
    url: 'http://localhost:9000',
  },
});

// Register the interceptor]
const interceptor = await register.interceptor();

// Register the proxy
const proxy = register.proxy(document.getElementById('token-vault'));

// Register the token store replacement
const storeReplacement = register.store();

/** ****************************************************
 * SDK CONFIGURATION
 */

import { Config, FRUser, TokenManager, UserManager } from '@forgerock/javascript-sdk';

Config.set({
  clientId: 'WebOAuthClient',
  redirectUri: `${window.location.origin}`,
  scope: 'openid profile me.read',
  serverConfig: {
    baseUrl: 'https://openam-crbrl-01.forgeblocks.com/am',
    timeout: 3000,
  },
  realmPath: 'alpha',
  tokenStore: storeReplacement,
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


/** ****************************************************
 * ATTACH USER EVENT LISTENERS
 */

const fetchMockBtn = document.getElementById('fetchMockBtn');
const fetchUserBtn = document.getElementById('fetchUserBtn');
const hasTokensBtn = document.getElementById('hasTokens');
const refreshTokensBtn = document.getElementById('refreshTokens');
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
hasTokensBtn.addEventListener('click', async (event) => {
  const hasTokens = await storeReplacement.has();
  console.log(hasTokens);
});
refreshTokensBtn.addEventListener('click', async (event) => {
  const refreshTokens = await storeReplacement.refresh();
  console.log(refreshTokens);
});
loginBtn.addEventListener('click', async (event) => {
  await TokenManager.getTokens({ login: 'redirect', forceRenew: true });
});
logoutBtn.addEventListener('click', async (event) => {
  // Not all endpoints are supported and will fail
  FRUser.logout();
});
