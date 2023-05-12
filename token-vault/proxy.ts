import {
  checkForMissingSlash,
  getEndpointPath,
  refreshOAuth2Tokens,
  resolve,
} from './_utils';

export function proxy(config) {
  const clientId = config?.forgerock?.clientId || 'WebOAuthClient';
  const clientOrigin = config?.proxy?.origin || 'http://localhost:8000';
  const fetchEventName = config?.events?.fetch || 'FETCH_RESOURCE';
  const hasTokenEventName = config?.events?.has || 'HAS_TOKENS';
  const refreshTokenEventName =
    config?.events?.refresh || 'REFRESH_TOKENS';
  const removeTokenEventName = config?.events?.remove || 'REMOVE_TOKENS';
  const scope = config?.forgerock?.scope || 'openid email';
  const setTokenEventName = config?.events?.set || 'SET_TOKENS';

  /**
   * Generate AM URLs
   */
  const forgerockBaseUrl = checkForMissingSlash(
    config?.forgerock?.serverConfig?.baseUrl
  );
  const realmPath = config?.forgerock?.realmPath || 'root';
  const urls = {
    revoke: `${resolve(forgerockBaseUrl, getEndpointPath('revoke', realmPath))}`,
    userInfo: `${resolve(forgerockBaseUrl, getEndpointPath('userInfo', realmPath))}`,
    accessToken: `${resolve(forgerockBaseUrl, getEndpointPath('accessToken', realmPath))}`,
  };

  window.addEventListener('message', async (event) => {
    const eventType = event.data?.type;
    const swChannel = event.ports[0];

    // Ignore all messages that don't come from the registered client
    if (event.origin !== clientOrigin) {
      return;
    }

    if (eventType === hasTokenEventName) {
      const tokensString = localStorage.getItem(clientId);
      let tokens;

      if (tokensString) {
        tokens = JSON.parse(tokensString) || {};
      }

      // Check if the Access Token exists
      // DO NOT RETURN THE TOKEN!
      const hasToken = Boolean(tokens.accessToken);
      swChannel.postMessage(hasToken);
      return;
    } else if (eventType === refreshTokenEventName) {
      const tokensString = localStorage.getItem(clientId);
      let tokens;

      if (tokensString) {
        tokens = JSON.parse(tokensString) || {};
      }

      let newTokens;

      try {
        newTokens = await refreshOAuth2Tokens({
          clientId,
          refreshToken: tokens.refreshToken,
          scope,
          url: urls.accessToken,
        });
        localStorage.setItem(clientId, JSON.stringify(newTokens));

        swChannel.postMessage(
          `Tokens for ${clientId} have been refreshed in Token Vault`
        );
        return;
      } catch (error) {
        swChannel.postMessage(error);
        return;
      }
    } else if (eventType === setTokenEventName) {
      /** ****************************************************
       * SET TOKENS
       */
      let tokens;

      try {
        tokens = JSON.stringify(event.data?.tokens);
      } catch (error) {
        // TODO: Handle error more intelligently
        tokens = {};
      }

      localStorage.setItem(clientId, tokens);
      swChannel.postMessage(
        `Tokens for ${clientId} have been set in Token Vault`
      );
      return;
    } else if (eventType === removeTokenEventName) {
      /** ****************************************************
       * REMOVE TOKENS
       */

      localStorage.removeItem(clientId);
      swChannel.postMessage(
        `Tokens for ${clientId} have been removed from Token Vault`
      );
      return;
    } else if (eventType === fetchEventName) {
      /** ****************************************************
       * FETCH RESOURCE
       */

      console.log(`Proxying ${event.data?.request?.url}`);

      const request = event.data?.request || {};
      const tokensString = localStorage.getItem(clientId);
      let tokens;

      if (tokensString) {
        tokens = JSON.parse(tokensString) || {};
      }

      let response;

      if (request.url?.includes('token/revoke')) {
        /**
         * The token revocation endpoint requires the token to be sent in the body
         */
        const bodyString = await request.options?.body?.text();
        const body = new URLSearchParams(bodyString);
        body.append('token', tokens.accessToken);

        response = await fetch(request.url, {
          ...request.options,
          body,
        });
      } else {
        response = await fetch(request.url, {
          ...request.options,
          headers: new Headers({
            ...request.options.headers,
            authorization: `Bearer ${tokens.accessToken}`,
          }),
        });
      }
      const json = await response.json();
      swChannel.postMessage(json);
    }
  });
}
