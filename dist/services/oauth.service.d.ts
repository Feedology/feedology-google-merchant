/**
 * 🔐 Google OAuth2 Service
 *
 * Handles Google OAuth2 for Merchant Center API access using google-auth-library
 * References:
 * - https://github.com/googleapis/google-auth-library-nodejs
 * - https://developers.google.com/identity/protocols/oauth2
 */
import type { GoogleOAuthToken } from '../types/google.js';
/**
 * Google OAuth2 Service using google-auth-library
 */
export declare class GoogleOAuthService {
    private readonly oauth2Client;
    private readonly scopes;
    private readonly clientId;
    private readonly clientSecret;
    constructor();
    /**
     * Generate OAuth2 authorization URL for redirect
     * @param redirectUrl - Redirect URL after authorization
     * @param state - Optional state data to encode (will be JSON stringified and base64 encoded)
     * @returns Authorization URL
     */
    getAuthorizationUrl(redirectUrl: string, state?: Record<string, unknown>): string;
    /**
     * Exchange authorization code for access token
     * @param code - Authorization code from callback
     * @param redirectUri - Redirect URI used in authorization (must match)
     * @returns OAuth tokens including access_token and refresh_token
     */
    exchangeCodeForTokens(code: string, redirectUri?: string): Promise<GoogleOAuthToken>;
    /**
     * Refresh access token using refresh token
     * @param refreshToken - Refresh token from previous OAuth flow
     * @returns New OAuth tokens
     */
    refreshAccessToken(refreshToken: string): Promise<GoogleOAuthToken>;
}
//# sourceMappingURL=oauth.service.d.ts.map