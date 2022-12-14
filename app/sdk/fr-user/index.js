/*
 * @forgerock/javascript-sdk
 *
 * index.ts
 *
 * Copyright (c) 2020 ForgeRock. All rights reserved.
 * This software may be modified and distributed under the terms
 * of the MIT license. See the LICENSE file for details.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
import OAuth2Client from '../oauth2-client/index.js';
import SessionManager from '../session-manager/index.js';
import TokenManager from '../token-manager/index.js';
import UserManager from '../user-manager/index.js';
/**
 * High-level API for logging a user in/out and getting profile information.
 */
var FRUser = /** @class */ (function () {
    function FRUser() {
    }
    /**
     * Logs the user in with the specified step handler, acquires OAuth tokens, and retrieves
     * user profile.  **Currently not implemented.**
     *
     * @typeparam T The type of user object expected
     * @param handler The function to invoke when handling authentication steps
     * @param options Configuration overrides
     */
    FRUser.login = function (handler, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                console.info(handler, options); // Avoid lint errors
                throw new Error('FRUser.login() not implemented');
            });
        });
    };
    /**
     * Logs the user in with the specified UI, acquires OAuth tokens, and retrieves user profile.
     *
     * @typeparam T The type of user object expected
     * @param ui The UI instance to use to acquire a session
     * @param options Configuration overrides
     */
    FRUser.loginWithUI = function (ui, options) {
        return __awaiter(this, void 0, void 0, function () {
            var currentUser, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, ui.getSession(options)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, TokenManager.getTokens({ forceRenew: true })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, UserManager.getCurrentUser()];
                    case 3:
                        currentUser = _a.sent();
                        return [2 /*return*/, currentUser];
                    case 4:
                        error_1 = _a.sent();
                        throw new Error('Login failed');
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Ends the user's session and revokes OAuth tokens.
     *
     * @param options Configuration overrides
     */
    FRUser.logout = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2, error_3, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Both invalidates the session on the server AND removes browser cookie
                        return [4 /*yield*/, SessionManager.logout(options)];
                    case 1:
                        // Both invalidates the session on the server AND removes browser cookie
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        console.warn('Session logout was not successful');
                        return [3 /*break*/, 3];
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        // Invalidates session on the server tied to the ID Token
                        // Needed for Express environment as session logout is unavailable
                        return [4 /*yield*/, OAuth2Client.endSession(options)];
                    case 4:
                        // Invalidates session on the server tied to the ID Token
                        // Needed for Express environment as session logout is unavailable
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        error_3 = _a.sent();
                        console.warn('OAuth endSession was not successful');
                        return [3 /*break*/, 6];
                    case 6:
                        _a.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, OAuth2Client.revokeToken(options)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8:
                        error_4 = _a.sent();
                        console.warn('OAuth revokeToken was not successful');
                        return [3 /*break*/, 9];
                    case 9: return [4 /*yield*/, TokenManager.deleteTokens()];
                    case 10:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return FRUser;
}());
export default FRUser;
//# sourceMappingURL=index.js.map