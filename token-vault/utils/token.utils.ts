import { ClientTokens, RefreshOAuth2TokensOptions, ServerTokens } from "../interface";
import { stringify } from "./network.utils";

export function getTokens(clientId: string): ClientTokens | undefined {
  const tokensString = localStorage.getItem(clientId);
  let tokens;

  if (tokensString) {
    try {
      tokens = JSON.parse(tokensString) || undefined;
    } catch (error) {
      // TODO: Handle error more intelligently
    }
  }

  return tokens;
}

export async function refreshTokens(config: RefreshOAuth2TokensOptions): Promise<Response> {
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

  return response;
}

export async function storeTokens(response: Response, clientId: string) {
  const newTokens: ServerTokens | undefined = await response.json();

  if (!newTokens) {
    throw new Error("No tokens found in response");
  }

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
