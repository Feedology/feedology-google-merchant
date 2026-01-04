/**
 * @Feedology/google-merchant
 * Google Merchant Center API client library
 */

// Types
export type { GoogleOAuthToken, GoogleOAuthScope, GoogleProductStatus } from './types/google.js';

// OAuth Service
export { GoogleOAuthService } from './services/oauth.service.js';

// Config
export { googleConfig, type GoogleConfig } from './config/google.config.js';

// Base Service
export { BaseMerchantService } from './services/merchant.service.js';

// Account Service
export {
    GoogleMerchantAccountService,
    googleMerchantAccountService,
    type AccountIssue,
    type ListIssuesResponse,
} from './services/merchant-account.service.js';

// Product Service
export {
    GoogleMerchantProductService,
    googleMerchantProductService,
    type ProductInput,
    type Product,
    type ListProductsResponse,
} from './services/merchant-product.service.js';

// Data Sources Service
export {
    GoogleMerchantDataSourcesService,
    googleMerchantDataSourcesService,
    type MerchantDataSource,
    type ListDataSourcesResponse,
} from './services/merchant-dataSources.service.js';

// Token Utils
export {
    getGoogleToken,
    isGoogleOAuthToken,
    type GetGoogleTokenResult,
} from './utils/token.util.js';

// Transformer
export {
    GoogleMerchantProductTransformer,
    googleMerchantProductTransformer,
} from './transformers/google-merchant-product.transformer.js';

// Transformer Types
export type {
    TransformerShop,
    TransformerFeed,
    TransformerProduct,
    TransformerProductVariant,
    TransformerFeedProductVariant,
    BrandSubmissionType,
    PriceType,
    ProductTypeField,
    ProductUrlSourceType,
    ProductIdentifierType,
    InventoryType,
    InventoryCustomSetting,
} from './types/transformer-input.js';

export {
    BRAND_SOURCE_TYPES,
    PRICE_TYPES,
    PRODUCT_TYPE_FIELDS,
    PRODUCT_URL_SOURCE_TYPES,
    PRODUCT_IDENTIFIER_TYPES,
    INVENTORY_TYPES,
    INVENTORY_CUSTOM_SETTINGS,
} from './types/transformer-input.js';

