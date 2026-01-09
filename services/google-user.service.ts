/**
 * 👤 Google User Info Service
 * 
 * Retrieves user information from Google OAuth2 access tokens or ID tokens
 * References:
 * - https://developers.google.com/identity/sign-in/web/backend-auth
 * - https://www.googleapis.com/oauth2/v3/userinfo
 */

import { OAuth2Client } from 'google-auth-library';
import type { GoogleUserInfo } from '../types/google.js';
import googleConfig from '../config/google.config.js';

/**
 * Google User Info Service
 * Fetches user profile information using access token or verifies ID token
 */
export class GoogleUserInfoService {
    private readonly oauth2Client: OAuth2Client;

    constructor() {
        this.oauth2Client = new OAuth2Client(googleConfig.clientId);
    }

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
    async getUserInfo(accessToken: string): Promise<GoogleUserInfo> {
        try {
            const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            return {
                sub: data.sub || '',
                name: data.name || null,
                given_name: data.given_name || null,
                family_name: data.family_name || null,
                picture: data.picture || null,
                email: data.email || null,
                email_verified: data.email_verified || false,
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get user info from access token: ${error.message}`);
            }
            throw new Error('Failed to get user info from access token: Unknown error');
        }
    }
}
