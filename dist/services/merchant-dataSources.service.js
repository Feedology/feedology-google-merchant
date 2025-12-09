/**
 * Google Merchant API - accounts.dataSources service
 * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1beta/accounts.dataSources
 */
import { BaseMerchantService } from './merchant.service.js';
export class GoogleMerchantDataSourcesService extends BaseMerchantService {
    static _instance = null;
    static getInstance() {
        if (!this._instance)
            this._instance = new GoogleMerchantDataSourcesService();
        return this._instance;
    }
    /**
     * Merchant API - list data sources
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/list
     *
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    async list(accountId, accessToken) {
        const url = `${this.baseUrl}/datasources/${this.apiVersion}/accounts/${accountId}/dataSources`;
        return this.makeRequest(url, {
            method: 'GET',
        }, accessToken);
    }
    /**
     * Merchant API - create data source
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/create
     *
     * @param accountId - Merchant Center account ID
     * @param payload - Data source payload
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    async create(accountId, payload, accessToken) {
        const url = `${this.baseUrl}/datasources/${this.apiVersion}/accounts/${accountId}/dataSources`;
        return this.makeRequest(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        }, accessToken);
    }
    /**
     * Merchant API - get data source
     * Reference: https://developers.google.com/merchant/api/reference/rest/datasources_v1/accounts.dataSources/get
     *
     * @param accountId - Merchant Center account ID
     * @param dataSourceId - Data source ID
     * @param accessToken - Plain access token string (use getTokenFromFeed() to get token from feed)
     */
    async get(accountId, dataSourceId, accessToken) {
        const url = `${this.baseUrl}/datasources/${this.apiVersion}/accounts/${accountId}/dataSources/${dataSourceId}`;
        return this.makeRequest(url, {
            method: 'GET',
        }, accessToken);
    }
    /**
     * Create a data source for a feed
     *
     * @param market - Market code (ISO country code, e.g., "US", "CA")
     * @param accountId - Merchant Center account ID
     * @param accessToken - Plain access token string
     * @returns Created data source
     */
    async createForFeed(market, accountId, accessToken) {
        const payload = { displayName: "Feedology Merchant API", primaryProductDataSource: { countries: [market] } };
        return await this.create(accountId, payload, accessToken);
    }
}
export const googleMerchantDataSourcesService = GoogleMerchantDataSourcesService.getInstance();
//# sourceMappingURL=merchant-dataSources.service.js.map