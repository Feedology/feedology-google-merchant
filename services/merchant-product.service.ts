/**
 * Google Merchant API - accounts.productInputs and accounts.products service
 * Reference: 
 * - https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.productInputs
 * - https://developers.google.com/merchant/api/reference/rest/products_v1beta/accounts.products
 */

import { BaseMerchantService } from './merchant.service.js';
import type { GoogleProductStatus } from '../types/google.js';

/**
 * ProductInput represents data submitted for a product
 * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1/accounts.productInputs
 */
export interface ProductInput {
    name?: string; // Format: accounts/{account}/productInputs/{productinput}
    product?: string; // Output only. Format: accounts/{account}/products/{product}
    channel: 'ONLINE'; // Required. Immutable. The channel of the product. Always 'ONLINE' for online products.
    offerId: string; // Required. Immutable. Your unique identifier for the product.
    contentLanguage: string; // Required. Immutable. The two-letter ISO 639-1 language code for the product.
    feedLabel: string; // Required. Immutable. The feed label that lets you categorize and identify your products. The maximum allowed characters are 20, and the supported characters are A-Z, 0-9, hyphen, and underscore. The feed label must not include any spaces.

    attributes: {
        itemGroupId: string;
        title: string;
        brand?: string;
        description: string;
        identifierExists: boolean;

        gtins?: string[];
        mpn?: string;

        link?: string;
        canonicalLink?: string;

        imageLink?: string;
        additionalImageLinks?: string[];

        price: {
            amountMicros: string; // Price in micros (price * 1,000,000)
            currencyCode: string; // Currency code, 3 uppercase chars (ISO 4217)
        };

        salePrice?: {
            amountMicros: string;
            currencyCode: string;
        };

        salePriceEffectiveDate?: {
            startTime?: string; // ISO 8601 with timezone
            endTime?: string; // ISO 8601 with timezone
        };

        autoPricingMinPrice?: {
            amountMicros: string;
            currencyCode: string;
        };

        maximumRetailPrice?: {
            amountMicros: string;
            currencyCode: string;
        };

        condition?: string; // new, used, refurbished
        availability?: string; // in stock, out of stock, preorder, backorder
        productTypes?: string[];
        googleProductCategory?: string; // Google product category ID

        customLabel0?: string;
        customLabel1?: string;
        customLabel2?: string;
        customLabel3?: string;
        customLabel4?: string;

        gender?: string;
        ageGroup?: string;
        size?: string;
        sizeTypes?: string[];
        sizeSystem?: string;
        color?: string;
        material?: string;
        pattern?: string;

        adult?: boolean;
        isBundle?: boolean;
        multipack?: string;
        energyEfficiencyClass?: string;
        minEnergyEfficiencyClass?: string;
        maxEnergyEfficiencyClass?: string;
        productHighlights?: string[];
        certifications?: Array<{
            certificationAuthority?: string;
            certificationName?: string;
            certificationCode?: string;
            certificationValue?: string;
        }>;

        shippingLabel?: string;
        shippingWeight?: {
            value: number;
            unit: string;
        };
        shippingLength?: {
            value: number;
            unit: string;
        };
        shippingWidth?: {
            value: number;
            unit: string;
        };
        shippingHeight?: {
            value: number;
            unit: string;
        };
        transitTimeLabel?: string;
        minHandlingTime?: string;
        maxHandlingTime?: string;
    };

    customAttributes?: Array<{
        name: string;
        value: string; // Must be string (arrays are converted to comma-separated strings)
    }>; // Optional. A list of custom (merchant-provided) attributes. Maximum allowed number of characters for each custom attribute is 10240 (represents sum of characters for name and value). Maximum 2500 custom attributes can be set per product, with total size of 102.4kB. Underscores in custom attribute names are replaced by spaces upon insertion.

    versionNumber?: string; // Optional. Immutable. Represents the existing version (freshness) of the product, which can be used to preserve the right order when multiple updates are done at the same time. If set, the insertion is prevented when version number is lower than the current version number of the existing product. Only supported for insertions into primary data sources. Do not set this field for updates. Do not set this field for insertions into supplemental data sources.
}

/**
 * Product represents the processed product after combining ProductInput with rules
 * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/Product
 */
export interface Product {
    name?: string; // Format: accounts/{account}/products/{product}
    id?: string; // Output only. The product ID
    offerId?: string; // Output only. Your unique identifier for the product
    channel?: string; // Output only. The channel of the product
    contentLanguage?: string; // Output only. The language code
    feedLabel?: string; // Output only. The feed label
    productStatus?: GoogleProductStatus; // Product status from Google Merchant Center
    [key: string]: unknown;
}

/**
 * List products response
 */
export interface ListProductsResponse {
    products?: Product[];
    nextPageToken?: string;
}

export class GoogleMerchantProductService extends BaseMerchantService {
    private static _instance: GoogleMerchantProductService | null = null;

    static getInstance(): GoogleMerchantProductService {
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
    async insertProductInput(
        accountId: string,
        productInput: Partial<ProductInput>,
        accessToken: string,
        dataSource?: string
    ): Promise<ProductInput> {
        let url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs:insert`;
        if (dataSource) {
            url += `?dataSource=${encodeURIComponent(dataSource)}`;
        }
        return this.makeRequest<ProductInput>(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInput),
            },
            accessToken
        );
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
    async getProductInput(
        accountId: string,
        productInputName: string,
        accessToken: string
    ): Promise<ProductInput> {
        const url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs/${productInputName}`;
        return this.makeRequest<ProductInput>(
            url,
            {
                method: 'GET',
            },
            accessToken
        );
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
    async patchProductInput(
        accountId: string,
        productInputName: string,
        productInput: Partial<ProductInput>,
        accessToken: string,
        dataSource: string,
        updateMask?: string
    ): Promise<ProductInput> {
        // Extract productInputId from name if it's a full path
        // Format: accounts/{account}/productInputs/{productinput}
        // Or use as-is if it's already just the productinput part
        let productInputId: string;
        if (productInputName.includes('/productInputs/')) {
            // Full path: extract the productinput part
            const parts = productInputName.split('/productInputs/');
            productInputId = parts[1] || productInputName;
        } else {
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
        return this.makeRequest<ProductInput>(
            url,
            {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(productInput),
            },
            accessToken
        );
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
    async deleteProductInput(
        accountId: string,
        productInputName: string,
        accessToken: string,
        dataSource?: string
    ): Promise<void> {
        let url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/productInputs/${productInputName}`;
        if (dataSource) {
            url += `?dataSource=${encodeURIComponent(dataSource)}`;
        }
        await this.makeRequest<void>(
            url,
            {
                method: 'DELETE',
            },
            accessToken
        );
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
    async getProduct(
        accountId: string,
        productId: string,
        accessToken: string
    ): Promise<Product> {
        const url = `${this.baseUrl}/products/${this.apiVersion}/accounts/${accountId}/products/${productId}`;
        return this.makeRequest<Product>(
            url,
            {
                method: 'GET',
            },
            accessToken
        );
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
    async listProducts(
        accountId: string,
        accessToken: string,
        pageSize?: number,
        pageToken?: string,
        channel?: string
    ): Promise<ListProductsResponse> {
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
        return this.makeRequest<ListProductsResponse>(
            url,
            {
                method: 'GET',
            },
            accessToken
        );
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
    buildProductInputName(
        accountId: string,
        channel: string,
        contentLanguage: string,
        feedLabel: string,
        offerId: string
    ): string {
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
    buildProductId(
        channel: string,
        contentLanguage: string,
        feedLabel: string,
        offerId: string
    ): string {
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
    buildProductName(accountId: string, productId: string): string {
        return `accounts/${accountId}/products/${productId}`;
    }
}

export const googleMerchantProductService = GoogleMerchantProductService.getInstance();
