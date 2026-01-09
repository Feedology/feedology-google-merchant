/**
 * 👤 Google User Info Service
 *
 * Retrieves user information from Google OAuth2 access tokens
 * References:
 * - https://www.googleapis.com/oauth2/v3/userinfo
 * - https://developers.google.com/identity/protocols/oauth2/web-implicit#obtaininguserprofileinformation
 */
import { OAuth2Client } from 'google-auth-library';
/**
 * Google User Info Service
 * Fetches user profile information using OAuth2 access token
 */
export class GoogleUserInfoService {
    oauth2Client;
    constructor() {
        this.oauth2Client = new OAuth2Client();
    }
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
    async getUserInfo(accessToken) {
        try {
            // Set the access token on the OAuth2 client
            this.oauth2Client.setCredentials({
                access_token: accessToken,
            });
            // Fetch user info using getTokenInfo
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken: accessToken,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Failed to get user info payload');
            }
            // Return structured user info
            return {
                sub: payload.sub,
                name: payload.name || null,
                given_name: payload.given_name || null,
                family_name: payload.family_name || null,
                picture: payload.picture || null,
                email: payload.email || null,
                email_verified: payload.email_verified || false,
                locale: payload.locale || null,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get user info: ${error.message}`);
            }
            throw new Error('Failed to get user info: Unknown error');
        }
    }
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
    async verifyIdToken(idToken) {
        try {
            const ticket = await this.oauth2Client.verifyIdToken({
                idToken: idToken,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            const payload = ticket.getPayload();
            if (!payload) {
                throw new Error('Failed to decode ID token payload');
            }
            return {
                sub: payload.sub,
                name: payload.name || null,
                given_name: payload.given_name || null,
                family_name: payload.family_name || null,
                picture: payload.picture || null,
                email: payload.email || null,
                email_verified: payload.email_verified || false,
                locale: payload.locale || null,
            };
        }
        catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to verify ID token: ${error.message}`);
            }
            throw new Error('Failed to verify ID token: Unknown error');
        }
    }
}
//# sourceMappingURL=google-user.service.js.map