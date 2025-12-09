/**
 * Google OAuth token type
 */
export interface GoogleOAuthToken {
    access_token: string;
    refresh_token: string;
    token_type: string; // e.g., "Bearer"
    expiry_date: number; // timestamp in milliseconds
    scope: string; // space-delimited scopes
}

/**
 * Google OAuth scope type
 */
export type GoogleOAuthScope = string;

/**
 * Google Merchant Center Product Status Types
 * 
 * Represents the structure of product_status JSON field from Google Merchant Center API
 */
export interface GoogleProductStatus {
    /**
     * Destination statuses per reporting context
     * Indicates approval status for different Google shopping destinations
     */
    destinationStatuses?: Array<{
        /**
         * Reporting context where this status applies
         * Examples: "FREE_LISTINGS", "SHOPPING_ADS", "DISPLAY_ADS", "LOCAL_INVENTORY_ADS"
         */
        reportingContext: string;
        
        /**
         * Countries where the product is disapproved (ISO country codes)
         * Example: ["US", "CA"]
         */
        disapprovedCountries?: string[];
    }>;
    
    /**
     * Item-level issues affecting the product
     * Contains detailed information about policy violations, missing data, or review requirements
     */
    itemLevelIssues?: Array<{
        /**
         * Issue code identifier
         * Examples:
         * - "pending_initial_policy_review_free_listings"
         * - "homepage_not_claimed"
         * - "missing_shipping_no_account_shipping_exist"
         */
        code: string;
        
        /**
         * Severity level of the issue
         * - "DISAPPROVED": Product will not show due to policy violations
         * - "PENDING": Product is awaiting review
         * - "DEMOTED": Product is approved but with limitations
         */
        severity: 'DISAPPROVED' | 'PENDING' | 'DEMOTED' | string;
        
        /**
         * Required resolution action
         * - "pending_processing": Issue will resolve automatically (wait)
         * - "merchant_action": Merchant must take action to resolve
         * - "pending_review": Issue is under review by Google
         */
        resolution: 'pending_processing' | 'merchant_action' | 'pending_review' | string;
        
        /**
         * Reporting context where this issue applies
         * Example: "FREE_LISTINGS"
         */
        reportingContext: string;
        
        /**
         * Human-readable issue description
         * Example: "Pending initial review"
         */
        description: string;
        
        /**
         * Detailed explanation of the issue
         * Example: "Please wait up to 3 business days for the review to be completed"
         */
        detail: string;
        
        /**
         * URL to documentation about this issue
         * Example: "https://support.google.com/merchants/answer/2948694"
         */
        documentation?: string;
        
        /**
         * Countries where this issue applies (ISO country codes)
         * Example: ["US"]
         */
        applicableCountries?: string[];
        
        /**
         * Optional: Product attribute affected by this issue
         * Example: "shipping", "price", "availability"
         */
        attribute?: string;
    }>;
    
    /**
     * ISO 8601 timestamp when the product status was first created
     * Example: "2025-11-13T10:49:28.322187Z"
     */
    creationDate?: string;
    
    /**
     * ISO 8601 timestamp when the status was last updated
     * Example: "2025-11-13T11:01:45.589873Z"
     */
    lastUpdateDate?: string;
    
    /**
     * ISO 8601 timestamp when the current status expires
     * Example: "2025-12-13T11:01:45.589873Z"
     */
    googleExpirationDate?: string;
}
