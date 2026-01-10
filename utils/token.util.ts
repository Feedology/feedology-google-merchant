import type { GoogleOAuthToken } from '../types/google.js';
import type { GoogleOAuthService } from '../services/oauth.service.js';

type TokenInput = GoogleOAuthToken;

export function isGoogleOAuthToken(obj: unknown): obj is GoogleOAuthToken {
    if (!obj || typeof obj !== 'object') return false;
    const t = obj as Record<string, unknown>;
    return (
        typeof t.access_token === 'string' &&
        typeof t.refresh_token === 'string' &&
        typeof t.token_type === 'string' &&
        typeof t.expiry_date === 'number'
    );
}

function GoogleOAuthTokenHasExpired(token: GoogleOAuthToken): boolean {
    const now = Date.now();
    // Consider token expired if less than 15 minutes remaining
    const fifteenMinutesMs = 15 * 60 * 1000; // 15 minutes in milliseconds
    const timeUntilExpiry = token.expiry_date - now;
    return timeUntilExpiry <= fifteenMinutesMs;
}

export interface GetGoogleTokenResult {
    token: GoogleOAuthToken;
    refreshed: boolean; // true if we refreshed using refresh_token and you should persist it
}

/**
 * Returns a valid GoogleOAuthToken. If input is an encrypted string, it is
 * decrypted and parsed. If the token appears expired, it is refreshed using
 * the refresh_token. The caller can check `refreshed` to decide persistence.
 */
export async function getGoogleToken(
    tokenLike: TokenInput,
    oauthService: GoogleOAuthService
): Promise<GetGoogleTokenResult> {
    if (!isGoogleOAuthToken(tokenLike)) {
        throw new Error('Token payload missing required fields');
    }

    const tokenObj = tokenLike as GoogleOAuthToken;
    const needsRefresh = GoogleOAuthTokenHasExpired(tokenObj);

    if (!needsRefresh) {
        return {
            token: {
                access_token: tokenObj.access_token,
                refresh_token: tokenObj.refresh_token,
                token_type: tokenObj.token_type,
                expiry_date: tokenObj.expiry_date,
            },
            refreshed: false,
        };
    }

    try {
        // Refresh using refresh_token
        const refreshedToken = await oauthService.refreshAccessToken(tokenObj.refresh_token);
        return { token: refreshedToken, refreshed: true };
    } catch (error) {
        throw new Error(`Failed to refresh token: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
}


