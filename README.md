# @Feedology/google-merchant

Google Merchant Center API client library for TypeScript.

## Project Structure

```
google-merchant/
├── config/
│   └── google.config.ts          # Google API configuration
├── services/
│   ├── merchant.service.ts        # Base merchant service
│   ├── oauth.service.ts          # OAuth2 authentication service
│   ├── google-user.service.ts    # User info service
│   ├── merchant-account.service.ts    # Account management
│   ├── merchant-product.service.ts    # Product management
│   └── merchant-dataSources.service.ts # Data sources management
├── transformers/
│   └── google-merchant-product.transformer.ts  # Product data transformer
├── types/
│   ├── google.ts                 # Google API types
│   └── transformer-input.ts      # Transformer input types
├── utils/
│   └── token.util.ts             # Token utilities
├── dist/                         # Compiled output
├── index.ts                      # Main entry point
├── package.json
├── tsconfig.json
└── README.md
```

## Configuration

Set environment variables before using the package:

```bash
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_MERCHANT_API_VERSION=v1beta  # optional, defaults to v1beta
```

Or import and use the config directly:

```typescript
import { googleConfig } from '@Feedology/google-merchant';

// Config is loaded from environment variables
console.log(googleConfig.clientId);
console.log(googleConfig.scopes);
```

## Usage

### OAuth Service

The OAuth service uses configuration from environment variables:

```typescript
import { GoogleOAuthService } from '@Feedology/google-merchant';

// Uses GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET from environment
const oauthService = new GoogleOAuthService();

// Generate authorization URL
const authUrl = oauthService.getAuthorizationUrl(
  'https://your-app.com/oauth/callback',
  { shopId: 123, feedId: 456 } // optional state data
);

// Exchange authorization code for tokens
const tokens = await oauthService.exchangeCodeForTokens(
  'authorization-code-from-callback',
  'https://your-app.com/oauth/callback' // must match redirect_uri used in getAuthorizationUrl
);

// Refresh access token
const refreshedToken = await oauthService.refreshAccessToken(refreshToken);
```

### Merchant Services

```typescript
import {
  googleMerchantAccountService,
  googleMerchantProductService,
  googleMerchantDataSourcesService,
} from '@Feedology/google-merchant';

// Account Service - List account issues
const issues = await googleMerchantAccountService.issues(
  accountId,
  accessToken,
  { pageSize: 50 }
);

// Product Service - List products
const products = await googleMerchantProductService.listProducts(
  accountId,
  accessToken,
  250, // pageSize
  undefined, // pageToken (optional)
  'ONLINE' // channel (optional)
);

// Product Service - Get a specific product
const product = await googleMerchantProductService.getProduct(
  accountId,
  'online~en~US~sku123', // productId format: channel~contentLanguage~feedLabel~offerId
  accessToken
);

// Product Service - Insert product input
const productInput = await googleMerchantProductService.insertProductInput(
  accountId,
  {
    channel: 'ONLINE',
    offerId: 'product-123',
    contentLanguage: 'en',
    feedLabel: 'US',
    attributes: {
      itemGroupId: 'group-123',
      title: 'Product Title',
      description: 'Product Description',
      price: {
        amountMicros: '1000000', // $1.00 in micros
        currencyCode: 'USD',
      },
    },
  },
  accessToken,
  'accounts/123456/dataSources/789' // dataSource (optional)
);

// Product Service - Get product input
const existingInput = await googleMerchantProductService.getProductInput(
  accountId,
  'online~en~US~product-123', // productInputName
  accessToken
);

// Product Service - Update product input (patch)
const updatedInput = await googleMerchantProductService.patchProductInput(
  accountId,
  'online~en~US~product-123', // productInputName
  {
    attributes: {
      title: 'Updated Product Title',
    },
  },
  accessToken,
  'accounts/123456/dataSources/789', // dataSource (required)
  'attributes.title' // updateMask (optional, for partial updates)
);

// Product Service - Delete product input
await googleMerchantProductService.deleteProductInput(
  accountId,
  'online~en~US~product-123', // productInputName
  accessToken,
  'accounts/123456/dataSources/789' // dataSource (optional)
);

// Data Sources Service - List data sources
const dataSources = await googleMerchantDataSourcesService.list(
  accountId,
  accessToken
);

// Data Sources Service - Get a specific data source
const dataSource = await googleMerchantDataSourcesService.get(
  accountId,
  'dataSourceId',
  accessToken
);

// Data Sources Service - Create a new data source
const newDataSource = await googleMerchantDataSourcesService.create(
  accountId,
  {
    displayName: 'My Data Source',
    primaryProductDataSource: {
      countries: ['US'],
    },
  },
  accessToken
);

// Data Sources Service - Create data source for a feed (helper method)
const feedDataSource = await googleMerchantDataSourcesService.createForFeed(
  'US', // market code
  accountId,
  accessToken
);
```

### Token Utilities

```typescript
import { getGoogleToken, GoogleOAuthService } from '@Feedology/google-merchant';

const oauthService = new GoogleOAuthService();

const result = await getGoogleToken(tokenData, oauthService);
if (result.refreshed) {
  // Save the new token - it was refreshed
  console.log('Token refreshed:', result.token);
}
```

### User Info Service

Get user profile information from Google OAuth2 tokens:

```typescript
import { GoogleUserInfoService } from '@Feedology/google-merchant';

const userInfoService = new GoogleUserInfoService();

// Get user info using access token
const userInfo = await userInfoService.getUserInfo(accessToken);
console.log(userInfo.email);      // user@example.com
console.log(userInfo.name);       // John Doe
console.log(userInfo.picture);    // https://lh3.googleusercontent.com/...
console.log(userInfo.sub);        // Unique Google ID
console.log(userInfo.email_verified); // true/false

// Verify ID token (if you have an ID token instead of access token)
const payload = await userInfoService.verifyIdToken(idToken);
console.log(payload.sub, payload.email);
```

**User Info Fields:**
- `sub` - Unique Google ID (required)
- `name` - Full name
- `given_name` - First name
- `family_name` - Last name
- `picture` - Profile picture URL
- `email` - Email address
- `email_verified` - Whether email is verified
- `locale` - User's locale (e.g., "en", "vi", "vi-VN")

### Product Transformer

Transform your product data into Google Merchant Center format. The transformer follows these mapping rules:

1. **DEFAULT**: Fills data from feed, product, and variant
2. **OVERRIDE**: If `field_mapping` exists in `feedProductVariant`, it overrides default values
3. **CONDITIONAL**: Some fields only appear when certain conditions are met (e.g., `gtins`/`mpn` when `identifierExists=true`)

**Key Features:**
- Automatic price conversion to micros (price × 1,000,000)
- Currency code formatting (ISO 4217, 3 uppercase chars)
- Language code formatting (ISO 639-1, 2 lowercase chars)
- Market code formatting (ISO 3166-1, 2 uppercase chars)
- UTM parameter injection for tracking
- Support for product-level variants (variant_id = 0)
- Field mapping overrides for custom values

```typescript
import {
  GoogleMerchantProductTransformer,
  INVENTORY_TYPES,
  INVENTORY_CUSTOM_SETTINGS,
  BRAND_SOURCE_TYPES,
  PRODUCT_IDENTIFIER_TYPES,
  type GoogleMerchantProductTransformInput,
} from '@Feedology/google-merchant';

const transformer = new GoogleMerchantProductTransformer();

const productInput = transformer.transform({
  shop: {
    shop_name: 'My Shop',
    domain: 'myshop.com',
  },
  feed: {
    id: 'feed-123',
    shop_id: 'shop-123',
    language: 'en',
    market: 'us',
    currency: 'USD',
    product_settings: {
      product_id: '{{shop_id}}_{{product_id}}_{{variant_id}}',
      product_title: '{{product_title}}',
      product_description: '{{product_description}}',
      brand_submission: BRAND_SOURCE_TYPES.VENDOR, // or STORE_NAME, PRIMARY_DOMAIN
      product_identifier: PRODUCT_IDENTIFIER_TYPES.GTIN, // or MPN, NO
      enable_sale_price: true,
    },
    metadata: {
      google_merchant_center: {
        account: {
          account_id: '123456',
        },
        product_category_id: '123', // Google product category ID
      },
    },
    tracking: {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'shopping',
    },
    inventory: {
      // Use Shopify inventory status
      type: INVENTORY_TYPES.SHOPIFY_INVENTORY,
      
      // Or use custom setting
      // type: INVENTORY_TYPES.CUSTOM,
      // custom_setting: INVENTORY_CUSTOM_SETTINGS.IN_STOCK,
      
      // Or always out of stock
      // type: INVENTORY_TYPES.OUT_OF_STOCK,
    },
  },
  product: {
    id: 'product-123',
    title: 'Product Title',
    description: 'Product Description',
    vendor: 'Brand Name',
    handle: 'product-handle',
    product_type: 'Clothing',
    category: {
      name: 'Shirts',
      full_name: 'Apparel > Clothing > Shirts',
    },
    collections: {
      collections: [
        { title: 'Summer Collection' },
        { title: 'New Arrivals' },
      ],
    },
    tags: {
      tags: ['sale', 'bestseller'],
    },
    seo: {
      title: 'SEO Title',
      description: 'SEO Description',
    },
  },
  variant: {
    id: 'variant-123',
    title: 'Variant Title',
    display_name: 'Size: Large, Color: Blue',
    price: 10.99,
    compare_at_price: 15.99,
    sku: 'SKU-123',
    barcode: '123456789012',
    inventory_quantity: 10,
    inventory_policy: 'deny', // or 'continue'
  },
  mainImage: 'https://example.com/image.jpg',
  feedProductVariant: {
    product_id: 'product-123',
    variant_id: 'variant-123',
    field_mapping: {
      // Optional field mappings to override defaults
      title: 'Custom Title Override',
      description: 'Custom Description Override',
      // ... other field overrides
    },
    metadata: {
      google_merchant_center: {
        offer_id: 'custom-offer-id', // Optional custom offer ID
      },
    },
  },
});
```

## API Reference

### Exports

**Services:**
- `GoogleOAuthService` - OAuth2 service for Google Merchant API
- `GoogleUserInfoService` - User info service for retrieving user profiles
- `BaseMerchantService` - Base service class for Merchant API operations
- `GoogleMerchantAccountService` - Account management service
  - `googleMerchantAccountService` - Singleton instance
- `GoogleMerchantProductService` - Product management service
  - `googleMerchantProductService` - Singleton instance
- `GoogleMerchantDataSourcesService` - Data sources management service
  - `googleMerchantDataSourcesService` - Singleton instance

**Utilities:**
- `getGoogleToken` - Token utility for refreshing tokens
- `isGoogleOAuthToken` - Type guard for OAuth tokens

**Transformer:**
- `GoogleMerchantProductTransformer` - Transform products to Google Merchant format
- `googleMerchantProductTransformer` - Singleton instance

**Types:**
- `GoogleOAuthToken` - OAuth token type
- `GoogleOAuthScope` - OAuth scope type
- `GoogleUserInfo` - User profile information type
- `GoogleProductStatus` - Product status type
- `GoogleConfig` - Configuration type
- `ProductInput` - Product input type for API
- `Product` - Product type (processed product)
- `ListProductsResponse` - Response type for list products
- `AccountIssue` - Account issue type
- `ListIssuesResponse` - Response type for list issues
- `MerchantDataSource` - Data source type
- `ListDataSourcesResponse` - Response type for list data sources
- `GetGoogleTokenResult` - Result type for getGoogleToken utility
- `TransformerShop`, `TransformerFeed`, `TransformerProduct`, `TransformerProductVariant`, `TransformerFeedProductVariant` - Transformer input types
- `GoogleMerchantProductTransformInput` - Complete transformer input type
- `BrandSubmissionType` - Brand submission type ('vendor', 'store_name', 'primary_domain')
- `PriceType` - Price type ('price', 'compare_at_price')
- `ProductTypeField` - Product type field ('product_type', 'category_name', 'category_fullname', 'collections', 'tags')
- `ProductUrlSourceType` - Product URL source type ('product_url', 'product_checkout_url', 'canonical_url')
- `ProductIdentifierType` - Product identifier type ('no', 'gtin', 'mpn')
- `InventoryType` - Inventory type ('shopify_inventory', 'out_of_stock', 'custom')
- `InventoryCustomSetting` - Custom inventory setting ('in_stock', 'out_of_stock', 'preorder', 'backorder')

**Configuration:**
- `googleConfig` - Default configuration from environment variables

**Constants:**
- `INVENTORY_TYPES` - Available inventory types
- `INVENTORY_CUSTOM_SETTINGS` - Available custom inventory settings
- `BRAND_SOURCE_TYPES` - Brand source type constants
- `PRICE_TYPES` - Price type constants
- `PRODUCT_TYPE_FIELDS` - Product type field constants
- `PRODUCT_URL_SOURCE_TYPES` - Product URL source type constants
- `PRODUCT_IDENTIFIER_TYPES` - Product identifier type constants

See the TypeScript definitions for full API documentation.
