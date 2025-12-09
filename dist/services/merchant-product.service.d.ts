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
    name?: string;
    product?: string;
    channel: 'ONLINE';
    offerId: string;
    contentLanguage: string;
    feedLabel: string;
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
            amountMicros: string;
            currencyCode: string;
        };
        salePrice?: {
            amountMicros: string;
            currencyCode: string;
        };
        salePriceEffectiveDate?: {
            startTime?: string;
            endTime?: string;
        };
        autoPricingMinPrice?: {
            amountMicros: string;
            currencyCode: string;
        };
        maximumRetailPrice?: {
            amountMicros: string;
            currencyCode: string;
        };
        condition?: string;
        availability?: string;
        productTypes?: string[];
        googleProductCategory?: string;
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
        value: string;
    }>;
    versionNumber?: string;
}
/**
 * Product represents the processed product after combining ProductInput with rules
 * Reference: https://developers.google.com/merchant/api/reference/rest/products_v1beta/Product
 */
export interface Product {
    name?: string;
    id?: string;
    offerId?: string;
    channel?: string;
    contentLanguage?: string;
    feedLabel?: string;
    productStatus?: GoogleProductStatus;
    [key: string]: unknown;
}
/**
 * List products response
 */
export interface ListProductsResponse {
    products?: Product[];
    nextPageToken?: string;
}
export declare class GoogleMerchantProductService extends BaseMerchantService {
    private static _instance;
    static getInstance(): GoogleMerchantProductService;
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
    insertProductInput(accountId: string, productInput: Partial<ProductInput>, accessToken: string, dataSource?: string): Promise<ProductInput>;
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
    getProductInput(accountId: string, productInputName: string, accessToken: string): Promise<ProductInput>;
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
    patchProductInput(accountId: string, productInputName: string, productInput: Partial<ProductInput>, accessToken: string, dataSource: string, updateMask?: string): Promise<ProductInput>;
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
    deleteProductInput(accountId: string, productInputName: string, accessToken: string, dataSource?: string): Promise<void>;
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
    getProduct(accountId: string, productId: string, accessToken: string): Promise<Product>;
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
    listProducts(accountId: string, accessToken: string, pageSize?: number, pageToken?: string, channel?: string): Promise<ListProductsResponse>;
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
    buildProductInputName(accountId: string, channel: string, contentLanguage: string, feedLabel: string, offerId: string): string;
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
    buildProductId(channel: string, contentLanguage: string, feedLabel: string, offerId: string): string;
    /**
     * Helper method to build product name (full path)
     * Format: accounts/{account}/products/{productId}
     *
     * @param accountId - Merchant Center account ID
     * @param productId - Product ID (format: channel~contentLanguage~feedLabel~offerId)
     * @returns Product name (full path)
     */
    buildProductName(accountId: string, productId: string): string;
}
export declare const googleMerchantProductService: GoogleMerchantProductService;
//# sourceMappingURL=merchant-product.service.d.ts.map