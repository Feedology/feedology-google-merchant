/**
 * @feedology/google-merchant
 * Google Merchant Center API client library
 */
export type { GoogleOAuthToken, GoogleOAuthScope, GoogleProductStatus } from './types/google.js';
export { GoogleOAuthService } from './services/oauth.service.js';
export { googleConfig, type GoogleConfig } from './config/google.config.js';
export { BaseMerchantService } from './services/merchant.service.js';
export { GoogleMerchantAccountService, googleMerchantAccountService, type AccountIssue, type ListIssuesResponse, } from './services/merchant-account.service.js';
export { GoogleMerchantProductService, googleMerchantProductService, type ProductInput, type Product, type ListProductsResponse, } from './services/merchant-product.service.js';
export { GoogleMerchantDataSourcesService, googleMerchantDataSourcesService, type MerchantDataSource, type ListDataSourcesResponse, } from './services/merchant-dataSources.service.js';
export { getGoogleToken, isGoogleOAuthToken, type GetGoogleTokenResult, } from './utils/token.util.js';
export { GoogleMerchantProductTransformer, googleMerchantProductTransformer, } from './transformers/google-merchant-product.transformer.js';
export type { TransformerShop, TransformerFeed, TransformerProduct, TransformerProductVariant, TransformerFeedProductVariant, BrandSubmissionType, PriceType, ProductTypeField, ProductUrlSourceType, ProductIdentifierType, } from './types/transformer-input.js';
export { BRAND_SOURCE_TYPES, PRICE_TYPES, PRODUCT_TYPE_FIELDS, PRODUCT_URL_SOURCE_TYPES, PRODUCT_IDENTIFIER_TYPES, } from './types/transformer-input.js';
//# sourceMappingURL=index.d.ts.map