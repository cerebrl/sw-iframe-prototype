import { proxy } from "../token-vault";

// Initialize the token vault proxy
proxy({
  forgerock: {
    clientId: 'WebOAuthClient',
    serverConfig: {
      baseUrl: 'https://openam-crbrl-01.forgeblocks.com/am',
      timeout: 3000,
    },
    realmPath: 'alpha',
    scope: 'openid profile me.read',
  },
});
