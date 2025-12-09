# @feedology/google-merchant

Google Merchant Center API client library for TypeScript.

## Project Structure

```
google-merchant/
├── config/
│   └── google.config.ts          # Google API configuration
├── services/
│   ├── merchant.service.ts        # Base merchant service
│   ├── oauth.service.ts          # OAuth2 authentication service
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
import { googleConfig } from '@feedology/google-merchant';

// Config is loaded from environment variables
console.log(googleConfig.clientId);
console.log(googleConfig.scopes);
```

## Usage

### OAuth Service

The OAuth service uses configuration from environment variables:

```typescript
import { GoogleOAuthService } from '@feedology/google-merchant';

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
} from '@feedology/google-merchant';

// List account issues
const issues = await googleMerchantAccountService.issues(
  accountId,
  accessToken,
  { pageSize: 50 }
);

// List products
const products = await googleMerchantProductService.listProducts(
  accountId,
  accessToken,
  250
);

// Insert product input
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
  accessToken
);

// List data sources
const dataSources = await googleMerchantDataSourcesService.list(
  accountId,
  accessToken
);
```

### Token Utilities

```typescript
import { getGoogleToken, GoogleOAuthService } from '@feedology/google-merchant';

const oauthService = new GoogleOAuthService();

const result = await getGoogleToken(tokenData, oauthService);
if (result.refreshed) {
  // Save the new token - it was refreshed
  console.log('Token refreshed:', result.token);
}
```

### Product Transformer

Transform your product data into Google Merchant Center format:

```typescript
import {
  GoogleMerchantProductTransformer,
  type GoogleMerchantProductTransformInput,
} from '@feedology/google-merchant';

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
    },
  },
  product: {
    id: 'product-123',
    title: 'Product Title',
    description: 'Product Description',
    vendor: 'Brand Name',
    handle: 'product-handle',
  },
  variant: {
    id: 'variant-123',
    title: 'Variant Title',
    price: 10.99,
    sku: 'SKU-123',
  },
  mainImage: 'https://example.com/image.jpg',
  feedProductVariant: {
    product_id: 'product-123',
    variant_id: 'variant-123',
    field_mapping: {
      // Optional field mappings
    },
  },
});
```

## API Reference

### Exports

**Services:**
- `GoogleOAuthService` - OAuth2 service for Google Merchant API
- `GoogleMerchantAccountService` - Account management service
- `GoogleMerchantProductService` - Product management service
- `GoogleMerchantDataSourcesService` - Data sources management service

**Utilities:**
- `getGoogleToken` - Token utility for refreshing tokens
- `isGoogleOAuthToken` - Type guard for OAuth tokens

**Transformer:**
- `GoogleMerchantProductTransformer` - Transform products to Google Merchant format
- `googleMerchantProductTransformer` - Singleton instance

**Types:**
- `GoogleOAuthToken` - OAuth token type
- `GoogleProductStatus` - Product status type
- `ProductInput` - Product input type for API
- `TransformerShop`, `TransformerFeed`, `TransformerProduct`, etc. - Transformer input types

**Configuration:**
- `googleConfig` - Default configuration from environment variables

See the TypeScript definitions for full API documentation.
