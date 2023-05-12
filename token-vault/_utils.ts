/*
 * @forgerock/javascript-sdk
 *
 * url.ts
 *
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */

export function checkForMissingSlash(url) {
  if (url && url.charAt(url.length - 1) !== '/') {
    return url + '/';
  }
  return url;
}

export function evaluateUrlForInterception(url, urls) {
  if (url.includes('access_token')) {
    console.log(`Evaluating ${url}`);
  }
  const outcome = urls?.includes(url);
  return outcome;
}

/**
 * Returns the base URL including protocol, hostname and any non-standard port.
 * The returned URL does not include a trailing slash.
 */
export function getBaseUrl(url) {
  const isNonStandardPort =
    (url.protocol === 'http:' && ['', '80'].indexOf(url.port) === -1) ||
    (url.protocol === 'https:' && ['', '443'].indexOf(url.port) === -1);
  const port = isNonStandardPort ? `:${url.port}` : '';
  const baseUrl = `${url.protocol}//${url.hostname}${port}`;
  return baseUrl;
}

export async function getBodyBlob(request) {
  // Return undefined early if GET or HEAD
  if (['GET', 'HEAD'].includes(request.method)) {
    return;
  }

  const blob = await request.clone().blob();

  if (blob && blob.size) {
    return blob;
  }
}

async function getBodyJsonOrText(response) {
  const contentType = response.headers.get('Content-Type');
  if (contentType && contentType.indexOf('application/json') > -1) {
    return await response.json();
  }
  return await response.text();
}

export function getEndpointPath(
  endpoint,
  realmPath,
  customPaths?: Record<string, string>,
) {
  const realmUrlPath = getRealmUrlPath(realmPath);
  const defaultPaths = {
    authenticate: `json/${realmUrlPath}/authenticate`,
    authorize: `oauth2/${realmUrlPath}/authorize`,
    accessToken: `oauth2/${realmUrlPath}/access_token`,
    endSession: `oauth2/${realmUrlPath}/connect/endSession`,
    userInfo: `oauth2/${realmUrlPath}/userinfo`,
    revoke: `oauth2/${realmUrlPath}/token/revoke`,
    sessions: `json/${realmUrlPath}/sessions/`,
  };
  if (customPaths && customPaths[endpoint]) {
    // TypeScript is not correctly reading the condition above
    // It's thinking that customPaths[endpoint] may result in undefined
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return customPaths[endpoint];
  } else {
    return defaultPaths[endpoint];
  }
}

export function getHeaders(request: Request) {
  return Array.from(request.headers.keys()).reduce((acc, key) => {
    acc[key] = request.headers.get(key);
    return acc;
  }, {});
}

/**
   * Exchanges an authorization code for OAuth tokens.
   */
export async function refreshOAuth2Tokens(config) {

  const requestParams = {
    client_id: config.clientId,
    grant_type: 'refresh_token',
    refresh_token: config.refreshToken,
    scope: config.scope,
  };

  const body = stringify(requestParams);
  const init = {
    body,
    headers: new Headers({
      'Content-Length': body.length.toString(),
      'Content-Type': 'application/x-www-form-urlencoded',
    }),
    method: 'POST',
  };

  const response = await fetch(config.url, init);
  const responseBody = await getBodyJsonOrText(response);

  if (response.status !== 200) {
    const message =
      typeof responseBody === 'string'
        ? `Expected 200, received ${response.status}`
        : this.parseError(responseBody);
    throw new Error(message);
  }

  const responseObject = responseBody;
  if (!responseObject.access_token) {
    throw new Error('Access token not found in response');
  }

  let tokenExpiry;
  if (responseObject.expires_in) {
    tokenExpiry = Date.now() + responseObject.expires_in * 1000;
  }

  return {
    accessToken: responseObject.access_token,
    idToken: responseObject.id_token,
    refreshToken: responseObject.refresh_token,
    tokenExpiry: tokenExpiry,
  };
}

export function getRealmUrlPath(realmPath) {
  // Split the path and scrub segments
  const names = (realmPath || '')
    .split('/')
    .map((x) => x.trim())
    .filter((x) => x !== '');

  // Ensure 'root' is the first realm
  if (names[0] !== 'root') {
    names.unshift('root');
  }

  // Concatenate into a URL path
  const urlPath = names.map((x) => `realms/${x}`).join('/');
  return urlPath;
}

export function parseQuery(fullUrl) {
  const url = new URL(fullUrl);
  const query = {};
  url.searchParams.forEach((v, k) => (query[k] = v));
  return query;
}

export function resolve(baseUrl, path) {
  const url = new URL(baseUrl);

  if (path.startsWith('/')) {
    return `${getBaseUrl(url)}${path}`;
  }

  const basePath = url.pathname.split('/');
  const destPath = path.split('/').filter((x) => !!x);
  const newPath = [...basePath.slice(0, -1), ...destPath].join('/');

  return `${getBaseUrl(url)}${newPath}`;
}

export function stringify(data) {
  const pairs: string[] = [];
  for (const k in data) {
    if (data[k]) {
      pairs.push(k + '=' + encodeURIComponent(data[k]));
    }
  }
  return pairs.join('&');
}
