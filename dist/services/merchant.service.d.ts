/**
 * Base class for Google Merchant API services
 */
export declare abstract class BaseMerchantService {
    protected readonly baseUrl = "https://merchantapi.googleapis.com";
    protected readonly apiVersion: string;
    /**
     * Make authenticated API request
     * Helper method for common fetch patterns
     *
     * @param url - Full API URL
     * @param options - Fetch options (method, headers, body)
     * @param accessToken - Plain access token string (already decrypted and refreshed if needed)
     * @returns Parsed JSON response
     * @throws Error if request fails
     */
    protected makeRequest<T>(url: string, options: {
        method?: string;
        headers?: Record<string, string>;
        body?: string;
    }, accessToken: string): Promise<T>;
}
//# sourceMappingURL=merchant.service.d.ts.map