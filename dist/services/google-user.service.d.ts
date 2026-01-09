/**
 * 👤 Google User Info Service
 *
 * Retrieves user information from Google OAuth2 access tokens or ID tokens
 * References:
 * - https://developers.google.com/identity/sign-in/web/backend-auth
 * - https://www.googleapis.com/oauth2/v3/userinfo
 */
import type { GoogleUserInfo } from '../types/google.js';
/**
 * Google User Info Service
 * Fetches user profile information using access token or verifies ID token
 */
export declare class GoogleUserInfoService {
    private readonly oauth2Client;
    constructor();
    /**
     * Get user information from Google token
     * @param token - Google OAuth2 access token
     * @returns User profile information
     *
     * @throws Error if token is invalid or request fails
     *
     * @example
     * ```typescript
     * const userInfoService = new GoogleUserInfoService();
     *
     * // Using access token
     * const userInfo = await userInfoService.getUserInfo(accessToken);
     *
     * console.log(userInfo.email, userInfo.name, userInfo.picture);
     * ```
     */
    getUserInfo(accessToken: string): Promise<GoogleUserInfo>;
}
//# sourceMappingURL=google-user.service.d.ts.map