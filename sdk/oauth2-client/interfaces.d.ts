import { StringDict } from '../shared/interfaces';
import { ConfigOptions } from '../config';
import { ResponseType } from './enums';
/**
 * Tokens returned after successful authentication.
 */
interface OAuth2Tokens {
    accessToken: string;
    idToken?: string;
    refreshToken?: string;
    tokenExpiry?: number;
}
/**
 * Response from access_token endpoint.
 */
interface AccessTokenResponse {
    access_token: string;
    id_token: string;
    refresh_token: string;
    expires_in: number;
}
/**
 * Options used when requesting the authorization URL.
 */
interface GetAuthorizationUrlOptions extends ConfigOptions {
    responseType: ResponseType;
    state?: string;
    verifier?: string;
    query?: StringDict<string>;
}
/**
 * Options used when requesting OAuth tokens.
 */
interface GetOAuth2TokensOptions extends ConfigOptions {
    authorizationCode: string;
    verifier?: string;
}
export { AccessTokenResponse, GetAuthorizationUrlOptions, GetOAuth2TokensOptions, OAuth2Tokens };
