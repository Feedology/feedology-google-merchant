/**
 * 🔐 Google OAuth2 Service
 *
 * Handles Google OAuth2 for Merchant Center API access using google-auth-library
 * References:
 * - https://github.com/googleapis/google-auth-library-nodejs
 * - https://developers.google.com/identity/protocols/oauth2
 */
import { OAuth2Client } from 'google-auth-library';
import googleConfig from '../config/google.config.js';
/**
 * Google OAuth2 Service using google-auth-library
 */
export class GoogleOAuthService {
    oauth2Client;
    scopes;
    clientId;
    clientSecret;
    constructor() {
        this.clientId = googleConfig.clientId;
        this.clientSecret = googleConfig.clientSecret;
        this.scopes = googleConfig.scopes;
        this.oauth2Client = new OAuth2Client(this.clientId, this.clientSecret);
    }
    /**
     * Generate OAuth2 authorization URL for redirect
     * @param redirectUrl - Redirect URL after authorization
     * @param state - Optional state data to encode (will be JSON stringified and base64 encoded)
     * @returns Authorization URL
     */
    getAuthorizationUrl(redirectUrl, state) {
        const stateEncoded = state ? btoa(JSON.stringify(state)) : undefined;
        const authorizeUrl = this.oauth2Client.generateAuthUrl({
            access_type: 'offline', // Required to get refresh_token
            scope: this.scopes,
            prompt: 'consent', // Force consent screen to get refresh_token
            redirect_uri: redirectUrl,
            state: stateEncoded,
        });
        return authorizeUrl;
    }
    /**
     * Exchange authorization code for access token
     * @param code - Authorization code from callback
     * @param redirectUri - Redirect URI used in authorization (must match)
     * @returns OAuth tokens including access_token and refresh_token
     */
    async exchangeCodeForTokens(code, redirectUri) {
        const client = redirectUri
            ? new OAuth2Client(this.clientId, this.clientSecret, redirectUri)
            : this.oauth2Client;
        const { tokens } = await client.getToken(code);
        if (!tokens.access_token) {
            throw new Error('No access token received');
        }
        if (!tokens.refresh_token) {
            throw new Error('No refresh_token received. Make sure to use prompt=consent');
        }
        return {
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            token_type: tokens.token_type || 'Bearer',
            expiry_date: tokens.expiry_date,
        };
    }
    /**
     * Refresh access token using refresh token
     * @param refreshToken - Refresh token from previous OAuth flow
     * @returns New OAuth tokens (note: refresh_token may change, caller should persist it)
     */
    async refreshAccessToken(refreshToken) {
        this.oauth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        if (!credentials.access_token) {
            throw new Error('Failed to refresh access token');
        }
        return {
            access_token: credentials.access_token,
            // Use new refresh_token if provided, otherwise keep the old one
            // Google may rotate refresh tokens, so caller should always persist the returned value
            refresh_token: credentials.refresh_token || refreshToken,
            token_type: credentials.token_type || 'Bearer',
            expiry_date: credentials.expiry_date,
        };
    }
}
//# sourceMappingURL=oauth.service.js.map