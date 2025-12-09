/**
 * Google Merchant API - accounts.dataSources service
 * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1beta/accounts.dataSources
 */
import { BaseMerchantService } from './merchant.service.js';
export interface MerchantDataSource {
    name?: string;
    dataSourceId?: string;
    displayName?: string;
    [key: string]: unknown;
}
export interface ListDataSourcesResponse {
    dataSources?: MerchantDataSource[];
    nextPageToken?: string;
}
export declare class GoogleMerchantDataSourcesService extends BaseMerchantService {
    private static _instance;
    static getInstance(): GoogleMerchantDataSourcesService;
    /**
     * Merchant API - list data sources
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/list
     *
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    list(accountId: string, accessToken: string): Promise<ListDataSourcesResponse>;
    /**
     * Merchant API - create data source
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/create
     *
     * @param accountId - Merchant Center account ID
     * @param payload - Data source payload
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    create(accountId: string, payload: Partial<MerchantDataSource>, accessToken: string): Promise<MerchantDataSource>;
    /**
     * Merchant API - get data source
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/get
     *
     * @param accountId - Merchant Center account ID
     * @param dataSourceId - Data source ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    get(accountId: string, dataSourceId: string, accessToken: string): Promise<MerchantDataSource>;
    /**
     * Create a data source for a feed
     *
     * @param feedId - Feed ID
     * @param market - Market code (ISO country code, e.g., "US", "CA")
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string
     * @returns Created data source
     */
    createForFeed(feedId: string, market: string, accountId: string, accessToken: string): Promise<MerchantDataSource>;
}
export declare const googleMerchantDataSourcesService: GoogleMerchantDataSourcesService;
//# sourceMappingURL=merchant-dataSources.service.d.ts.map