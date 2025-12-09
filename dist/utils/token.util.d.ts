import type { GoogleOAuthToken } from '../types/google.js';
import type { GoogleOAuthService } from '../services/oauth.service.js';
type TokenInput = GoogleOAuthToken;
export declare function isGoogleOAuthToken(obj: unknown): obj is GoogleOAuthToken;
export interface GetGoogleTokenResult {
    token: GoogleOAuthToken;
    refreshed: boolean;
}
/**
 * Returns a valid GoogleOAuthToken. If input is an encrypted string, it is
 * decrypted and parsed. If the token appears expired, it is refreshed using
 * the refresh_token. The caller can check `refreshed` to decide persistence.
 */
export declare function getGoogleToken(tokenLike: TokenInput, oauthService: GoogleOAuthService): Promise<GetGoogleTokenResult>;
export {};
//# sourceMappingURL=token.util.d.ts.map