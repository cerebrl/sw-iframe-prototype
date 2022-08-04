/*
 * @forgerock/javascript-sdk
 *
 * helpers.ts
 *
 * Copyright (c) 2022 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
/**
 * @module
 * @ignore
 * These are private utility functions for Token Manager
 */
export function tokensWillExpireWithinThreshold(oauthThreshold, tokenExpiry) {
    if (oauthThreshold && tokenExpiry) {
        return tokenExpiry - oauthThreshold < Date.now();
    }
    return false;
}
//# sourceMappingURL=helpers.js.map