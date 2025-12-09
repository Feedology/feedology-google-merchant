/**
 * Google Merchant API - accounts.issues service
 * Reference: https://developers.google.com/merchant/api/reference/rest/accounts_v1beta/accounts.issues/list
 */
import { BaseMerchantService } from './merchant.service.js';
/**
 * AccountIssue represents an issue from a Merchant Center account
 * Reference: https://developers.google.com/merchant/api/reference/rest/accounts_v1beta/accounts.issues#AccountIssue
 */
export interface AccountIssue {
    /**
     * Issue code identifier
     * Examples: "pending_initial_policy_review_free_listings", "homepage_not_claimed"
     */
    code?: string;
    /**
     * Severity level of the issue
     * - "DISAPPROVED": Account will not show due to policy violations
     * - "PENDING": Account is awaiting review
     * - "DEMOTED": Account is approved but with limitations
     */
    severity?: 'DISAPPROVED' | 'PENDING' | 'DEMOTED' | string;
    /**
     * Required resolution action
     * - "pending_processing": Issue will resolve automatically (wait)
     * - "merchant_action": Merchant must take action to resolve
     * - "pending_review": Issue is under review by Google
     */
    resolution?: 'pending_processing' | 'merchant_action' | 'pending_review' | string;
    /**
     * Human-readable issue description
     */
    description?: string;
    /**
     * Detailed explanation of the issue
     */
    detail?: string;
    /**
     * URL to documentation about this issue
     */
    documentation?: string;
    /**
     * Countries where this issue applies (ISO country codes)
     */
    applicableCountries?: string[];
    /**
     * Reporting context where this issue applies
     * Example: "FREE_LISTINGS", "SHOPPING_ADS"
     */
    reportingContext?: string;
    /**
     * Additional fields that may be present in the response
     */
    [key: string]: unknown;
}
/**
 * List issues response
 */
export interface ListIssuesResponse {
    accountIssues?: AccountIssue[];
    nextPageToken?: string;
}
/**
 * Google Merchant Account Service
 * Handles account-level operations for Google Merchant Center API
 */
export declare class GoogleMerchantAccountService extends BaseMerchantService {
    private static _instance;
    static getInstance(): GoogleMerchantAccountService;
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
    issues(accountId: string, accessToken: string, options?: {
        pageSize?: number;
        pageToken?: string;
        languageCode?: string;
        timeZone?: string;
    }): Promise<ListIssuesResponse>;
}
export declare const googleMerchantAccountService: GoogleMerchantAccountService;
//# sourceMappingURL=merchant-account.service.d.ts.map