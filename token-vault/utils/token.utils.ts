import { GetOAuth2TokensOptions } from "@forgerock/javascript-sdk";
import { ClientTokens, ServerTokens } from "../interface";
import { getBodyJsonOrText, parseError, stringify,  } from "./network.utils";
/**
 * Exchanges an refresh token for access tokens.
 */
type RefreshOAuth2TokensOptionsInit = Omit<
  GetOAuth2TokensOptions,
  "authorizationCode"
>;
interface RefreshOAuth2TokensOptions extends RefreshOAuth2TokensOptionsInit {
  refreshToken: string;
  url: string;
}

export function getTokens(clientId: string) {
  const tokensString = localStorage.getItem(clientId);
  let tokens;

  if (tokensString) {
    try {
      tokens = JSON.parse(tokensString) || {};
    } catch (error) {
      // TODO: Handle error more intelligently
    }
  }

  return tokens;
}

export async function refreshTokens(config: RefreshOAuth2TokensOptions) {
  const requestParams = {
    client_id: config.clientId || "",
    grant_type: "refresh_token",
    refresh_token: config.refreshToken || "",
    scope: config.scope || "openid",
  };

  const body = stringify(requestParams);
  const init = {
    body,
    headers: new Headers({
      "Content-Length": body.length.toString(),
      "Content-Type": "application/x-www-form-urlencoded",
    }),
    method: "POST",
  };

  const response = await fetch(config.url, init);
  const responseBody = await getBodyJsonOrText(response.clone());

  if (response.status !== 200) {
    const message =
      typeof responseBody === "string"
        ? `Expected 200, received ${response.status}`
        : parseError(responseBody);
    throw new Error(message);
  }

  const responseObject: ServerTokens = responseBody;
  if (!responseObject.access_token) {
    throw new Error("Access token not found in response");
  }

  return response;
}

export async function requestTokens(request: any): Promise<Response> {
  const response = await fetch(request.url, {
    ...request.options,
    headers: new Headers({
      ...request.options.headers,
    }),
  });

  const responseBody = await getBodyJsonOrText(response.clone());

  if (response.status !== 200) {
    const message =
      typeof responseBody === "string"
        ? `Expected 200, received ${response.status}`
        : parseError(responseBody);
    throw new Error(message);
  }

  const responseObject: ServerTokens = responseBody;
  if (!responseObject.access_token) {
    throw new Error("Access token not found in response");
  }

  return response;
}

export async function exchangeCodeForOAuthTokens() {}

export async function storeTokens(response: Response, clientId: string) {
  // Save original tokens to localStorage
  const tokenStr = await response.text();

  const newTokens: ServerTokens = JSON.parse(tokenStr);

  let tokenExpiry: number | undefined;
  if (newTokens.expires_in) {
    tokenExpiry = Date.now() + newTokens.expires_in * 1000;
  }

  const clientTokens: ClientTokens = {
    accessToken: newTokens.access_token,
    idToken: newTokens.id_token,
    refreshToken: newTokens.refresh_token,
    scope: newTokens.scope,
    tokenExpiry,
  };
  localStorage.setItem(clientId, JSON.stringify(clientTokens));
}
