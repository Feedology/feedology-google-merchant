/**
 * Google Merchant API - accounts.dataSources service
 * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1beta/accounts.dataSources
 */

import { BaseMerchantService } from './merchant.service.js';

export interface MerchantDataSource {
    name?: string; // e.g. accounts/{accountId}/dataSources/{dataSourceId}
    dataSourceId?: string;
    displayName?: string;
    // Note: creation accepts minimal fields; advanced fields vary by type
    [key: string]: unknown;
}

export interface ListDataSourcesResponse {
    dataSources?: MerchantDataSource[];
    nextPageToken?: string;
}

export class GoogleMerchantDataSourcesService extends BaseMerchantService {
    private static _instance: GoogleMerchantDataSourcesService | null = null;

    static getInstance(): GoogleMerchantDataSourcesService {
        if (!this._instance) this._instance = new GoogleMerchantDataSourcesService();
        return this._instance;
    }

    /**
     * Merchant API - list data sources
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/list
     * 
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    async list(accountId: string, accessToken: string): Promise<ListDataSourcesResponse> {
        const url = `${this.baseUrl}/datasources/${this.apiVersion}/accounts/${accountId}/dataSources`;
        return this.makeRequest<ListDataSourcesResponse>(
            url,
            {
                method: 'GET',
            },
            accessToken
        );
    }

    /**
     * Merchant API - create data source
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/create
     * 
     * @param accountId - Merchant Center account ID
     * @param payload - Data source payload
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    async create(accountId: string, payload: Partial<MerchantDataSource>, accessToken: string): Promise<MerchantDataSource> {
        const url = `${this.baseUrl}/datasources/${this.apiVersion}/accounts/${accountId}/dataSources`;
        return this.makeRequest<MerchantDataSource>(
            url,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            },
            accessToken
        );
    }

    /**
     * Merchant API - get data source
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/get
     * 
     * @param accountId - Merchant Center account ID
     * @param dataSourceId - Data source ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    async get(accountId: string, dataSourceId: string, accessToken: string): Promise<MerchantDataSource> {
        const url = `${this.baseUrl}/datasources/${this.apiVersion}/accounts/${accountId}/dataSources/${dataSourceId}`;
        return this.makeRequest<MerchantDataSource>(
            url,
            {
                method: 'GET',
            },
            accessToken
        );
    }

    /**
     * Create a data source for a feed
     * 
     * @param feedId - Feed ID
     * @param market - Market code (ISO country code, e.g., "US", "CA")
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string
     * @returns Created data source
     */
    async createForFeed(feedId: string, market: string, accountId: string, accessToken: string): Promise<MerchantDataSource> {
        const displayName = `Feedology_feed_${feedId}`;
        // List data sources and check if a data source with the same displayName exists
        // const list = await this.list(accountId, accessToken);
        // const existing = (list.dataSources || []).find(ds => (ds.displayName || '').toLowerCase() === displayName.toLowerCase());
        // if (existing) return existing;

        // Create a new data source
        const payload: Partial<MerchantDataSource> = { displayName, primaryProductDataSource: { countries: [market] } };
        return await this.create(accountId, payload, accessToken);
    }
}

export const googleMerchantDataSourcesService = GoogleMerchantDataSourcesService.getInstance();
