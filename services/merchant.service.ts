import googleConfig from '../config/google.config.js';

/**
 * Base class for Google Merchant API services
 */
export abstract class BaseMerchantService {
    protected readonly baseUrl = 'https://merchantapi.googleapis.com';
    protected readonly apiVersion = googleConfig.merchantApiVersion;

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
    protected async makeRequest<T>(
        url: string,
        options: {
            method?: string;
            headers?: Record<string, string>;
            body?: string;
        },
        accessToken: string
    ): Promise<T> {
        const resp = await fetch(url, {
            ...options,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Accept': 'application/json',
                ...(options.headers || {}),
            },
        });
        
        const text = await resp.text();
        const json = text ? JSON.parse(text) : {};
        
        if (!resp.ok) {
            const message = (json?.error?.message as string | undefined) || String(resp.status);
            throw new Error(message);
        }
        
        return json as T;
    }
}

