/**
 * Google Merchant API - accounts.issues service
 * Reference: https://developers.google.com/merchant/api/reference/rest/accounts_v1beta/accounts.issues/list
 */
import { BaseMerchantService } from './merchant.service.js';
/**
 * Google Merchant Account Service
 * Handles account-level operations for Google Merchant Center API
 */
export class GoogleMerchantAccountService extends BaseMerchantService {
    static _instance = null;
    static getInstance() {
        if (!this._instance) {
            this._instance = new GoogleMerchantAccountService();
        }
        return this._instance;
    }
    /**
     * Merchant API - list account issues
     * Lists all account issues of a Merchant Center account
     *
     * When called on a multi-client account, this method only returns issues belonging to that account,
     * not its sub-accounts. To retrieve issues for sub-accounts, you must first call the
     * `accounts.listSubaccounts` method to obtain a list of sub-accounts, and then call
     * `accounts.issues.list` for each sub-account individually.
     *
     * Reference: https://developers.google.com/merchant/api/reference/rest/accounts_v1beta/accounts.issues/list
     *
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @param options - Optional query parameters
     * @param options.pageSize - Maximum number of issues to return (default: 50, max: 100)
     * @param options.pageToken - Token for pagination (from previous list call)
     * @param options.languageCode - BCP-47 language code for human-readable fields (default: en-US)
     * @param options.timeZone - IANA timezone for localizing times (default: America/Los_Angeles)
     * @returns List of account issues with pagination token
     */
    async issues(accountId, accessToken, options) {
        const params = new URLSearchParams();
        if (options?.pageSize !== undefined) {
            // Coerce to max 100 if above 100
            const pageSize = Math.min(options.pageSize, 100);
            params.append('pageSize', String(pageSize));
        }
        if (options?.pageToken) {
            params.append('pageToken', options.pageToken);
        }
        if (options?.languageCode) {
            params.append('languageCode', options.languageCode);
        }
        if (options?.timeZone) {
            params.append('timeZone', options.timeZone);
        }
        const queryString = params.toString();
        const url = `${this.baseUrl}/accounts/${this.apiVersion}/accounts/${accountId}/issues${queryString ? `?${queryString}` : ''}`;
        return this.makeRequest(url, {
            method: 'GET',
        }, accessToken);
    }
}
export const googleMerchantAccountService = GoogleMerchantAccountService.getInstance();
//# sourceMappingURL=merchant-account.service.js.map