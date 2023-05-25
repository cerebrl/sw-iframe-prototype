import type { ConfigOptions } from "@forgerock/javascript-sdk";

export type BaseConfig = {
  app: {
    origin: string;
    url: string;
  },
  events?: {
    fetch?: string;
    has?: string;
    refresh?: string;
    remove?: string;
    set?: string;
  };
  forgerock: ForgeRockConfig;
  interceptor: {
    file: string;
    type?: "classic" | "module";
  };
  proxy: {
    id?: string;
    origin: string;
    url?: string;
  };
};

export type ClientTokens = {
  accessToken: string;
  idToken: string;
  refreshToken: string;
  scope: string;
  tokenExpiry: number | undefined;
};

export interface ForgeRockConfig extends ConfigOptions {
  serverConfig: {
    baseUrl: string;
    timeout?: number;
  };
}

type ProxyConfigInit = Partial<BaseConfig>;

export interface ProxyConfig extends ProxyConfigInit {
  app: BaseConfig["app"];
  forgerock: BaseConfig["forgerock"];
}

export type ResponseClone = {
  body: any;
  headers: Record<string, string | null>;
  ok: boolean;
  redirected: boolean;
  status: number;
  statusText: string;
  type: string;
  url: string;
};

export type ServerTokens = {
  access_token: string;
  expires_in: number;
  id_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
}
