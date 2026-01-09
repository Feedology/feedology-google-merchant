/**
 * 👤 Google User Info Service
 *
 * Retrieves user information from Google OAuth2 access tokens
 * References:
 * - https://www.googleapis.com/oauth2/v3/userinfo
 * - https://developers.google.com/identity/protocols/oauth2/web-implicit#obtaininguserprofileinformation
 */
import type { GoogleUserInfo } from '../types/google.js';
/**
 * Google User Info Service
 * Fetches user profile information using OAuth2 access token
 */
export declare class GoogleUserInfoService {
    private readonly oauth2Client;
    constructor();
    /**
     * Get user information from Google OAuth2 token
     * @param accessToken - Valid OAuth2 access token
     * @returns User profile information
     *
     * @throws Error if token is invalid or request fails
     *
     * @example
     * ```typescript
     * const userInfoService = new GoogleUserInfoService();
     * const userInfo = await userInfoService.getUserInfo(accessToken);
     * console.log(userInfo.email, userInfo.name, userInfo.picture);
     * ```
     */
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
    /**
     * Verify and decode ID token
     * @param idToken - Google ID token (JWT)
     * @returns Decoded token payload
     *
     * @throws Error if token is invalid or verification fails
     *
     * @example
     * ```typescript
     * const userInfoService = new GoogleUserInfoService();
     * const payload = await userInfoService.verifyIdToken(idToken);
     * console.log(payload.sub, payload.email);
     * ```
     */
    verifyIdToken(idToken: string): Promise<GoogleUserInfo>;
}
//# sourceMappingURL=google-user.service.d.ts.map