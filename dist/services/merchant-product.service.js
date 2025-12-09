/**
 * Google Merchant API - accounts.productInputs and accounts.products service
 * Reference:
 * - https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs
 * - https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products
 */
import { BaseMerchantService } from './merchant.service.js';
export class GoogleMerchantProductService extends BaseMerchantService {
    static _instance = null;
    static getInstance() {
        if (!this._instance) {
            this._instance = new GoogleMerchantProductService();
        }
        return this._instance;
    }
    /**
     * Merchant API - insert product input
     * Uploads a product input to your Merchant Center account
     * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs/insert
     *
     * @param accountId - Merchant Center account ID
     * @param productInput - Product input data
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @param dataSource - Optional. Data source name (Format: accounts/{account}/dataSources/{datasource})
     * @returns Created product input
     */
    async insertProductInput(accountId, productInput, accessToken, dataSource) {
        let url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs:insert`;
        if (dataSource) {
            url += `?dataSource=${encodeURIComponent(dataSource)}`;
        }
        return this.makeRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productInput),
        }, accessToken);
    }
    /**
     * Merchant API - get product input
     * Retrieves a product input from your Merchant Center account
     * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs/get
     *
     * @param accountId - Merchant Center account ID
     * @param productInputName - Product input name (Format: accounts/{account}/productInputs/{productinput})
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @returns Product input data
     */
    async getProductInput(accountId, productInputName, accessToken) {
        const url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs/${productInputName}`;
        return this.makeRequest(url, {
            method: 'GET',
        }, accessToken);
    }
    /**
     * Merchant API - patch product input
     * Updates the existing product input in your Merchant Center account
     * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs/patch
     *
     * @param accountId - Merchant Center account ID
     * @param productInputName - Product input name (Format: accounts/{account}/productInputs/{productinput})
     *                          Can be full path or just the productinput part (channel~contentLanguage~feedLabel~offerId)
     * @param productInput - Product input data to update
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @param dataSource - Required. Data source name (Format: accounts/{account}/dataSources/{datasource})
     * @param updateMask - Optional. Field mask for partial updates
     * @returns Updated product input
     */
    async patchProductInput(accountId, productInputName, productInput, accessToken, dataSource, updateMask) {
        // Extract productInputId from name if it's a full path
        // Format: accounts/{account}/productInputs/{productinput}
        // Or use as-is if it's already just the productinput part
        let productInputId;
        if (productInputName.includes('/productInputs/')) {
            // Full path: extract the productinput part
            const parts = productInputName.split('/productInputs/');
            productInputId = parts[1] || productInputName;
        }
        else {
            // Already just the productinput part
            productInputId = productInputName;
        }
        // Build URL: PATCH /products/v1beta/accounts/{accountId}/productInputs/{productinput}
        let url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs/${productInputId}`;
        const params = new URLSearchParams();
        // dataSource is required for patch
        params.append('dataSource', dataSource);
        if (updateMask) {
            params.append('updateMask', updateMask);
        }
        const queryString = params.toString();
        if (queryString) {
            url += `?${queryString}`;
        }
        return this.makeRequest(url, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(productInput),
        }, accessToken);
    }
    /**
     * Merchant API - delete product input
     * Deletes a product input from your Merchant Center account
     * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs/delete
     *
     * @param accountId - Merchant Center account ID
     * @param productInputName - Product input name (Format: accounts/{account}/productInputs/{productinput})
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @param dataSource - Optional. Data source name (Format: accounts/{account}/dataSources/{datasource})
     */
    async deleteProductInput(accountId, productInputName, accessToken, dataSource) {
        let url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs/${productInputName}`;
        if (dataSource) {
            url += `?dataSource=${encodeURIComponent(dataSource)}`;
        }
        await this.makeRequest(url, {
            method: 'DELETE',
        }, accessToken);
    }
    /**
     * Merchant API - get product
     * Retrieves a product from your Merchant Center account
     * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products/get
     *
     * @param accountId - Merchant Center account ID
     * @param productId - Product ID (Format: channel~contentLanguage~feedLabel~offerId, e.g., "online~en~US~sku123")
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @returns Product data
     */
    async getProduct(accountId, productId, accessToken) {
        const url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/products/${productId}`;
        return this.makeRequest(url, {
            method: 'GET',
        }, accessToken);
    }
    /**
     * Merchant API - list products
     * Lists products in your Merchant Center account
     * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products/list
     *
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     * @param pageSize - Optional. Maximum number of products to return (default: 250, max: 250)
     * @param pageToken - Optional. Token for pagination
     * @param channel - Optional. Filter by channel (ONLINE, LOCAL)
     * @returns List of products with pagination token
     */
    async listProducts(accountId, accessToken, pageSize, pageToken, channel) {
        const params = new URLSearchParams();
        if (pageSize !== undefined) {
            params.append('pageSize', String(pageSize));
        }
        if (pageToken) {
            params.append('pageToken', pageToken);
        }
        if (channel) {
            params.append('channel', channel);
        }
        const queryString = params.toString();
        const url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/products${queryString ? `?${queryString}` : ''}`;
        return this.makeRequest(url, {
            method: 'GET',
        }, accessToken);
    }
    /**
     * Helper method to build product input name
     * Format: accounts/{account}/productInputs/{channel}~{contentLanguage}~{feedLabel}~{offerId}
     * For v1beta: channel~contentLanguage~feedLabel~offerId
     *
     * @param accountId - Merchant Center account ID
     * @param channel - Product channel (ONLINE, LOCAL)
     * @param contentLanguage - Two-letter ISO 639-1 language code
     * @param feedLabel - Feed label
     * @param offerId - Product offer ID
     * @returns Product input name
     */
    buildProductInputName(accountId, channel, contentLanguage, feedLabel, offerId) {
        const productInputId = `${channel}~${contentLanguage}~${feedLabel}~${offerId}`;
        return `accounts/${accountId}/productInputs/${productInputId}`;
    }
    /**
     * Helper method to build product ID
     * Format: channel~contentLanguage~feedLabel~offerId
     *
     * @param channel - Product channel (ONLINE, LOCAL)
     * @param contentLanguage - Two-letter ISO 639-1 language code
     * @param feedLabel - Feed label
     * @param offerId - Product offer ID
     * @returns Product ID (format: channel~contentLanguage~feedLabel~offerId)
     */
    buildProductId(channel, contentLanguage, feedLabel, offerId) {
        return `${channel}~${contentLanguage}~${feedLabel}~${offerId}`;
    }
    /**
     * Helper method to build product name (full path)
     * Format: accounts/{account}/products/{productId}
     *
     * @param accountId - Merchant Center account ID
     * @param productId - Product ID (format: channel~contentLanguage~feedLabel~offerId)
     * @returns Product name (full path)
     */
    buildProductName(accountId, productId) {
        return `accounts/${accountId}/products/${productId}`;
    }
}
export const googleMerchantProductService = GoogleMerchantProductService.getInstance();
//# sourceMappingURL=merchant-product.service.js.map