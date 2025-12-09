/**
 * Minimal types for transformer input
 * These types define only the fields needed by the transformer
 */

export type BrandSubmissionType = 'vendor' | 'store_name' | 'primary_domain';
export type PriceType = 'price' | 'compare_at_price';
export type ProductTypeField = 'product_type' | 'category_name' | 'category_fullname' | 'collections' | 'tags';
export type ProductUrlSourceType = 'product_url' | 'product_checkout_url' | 'canonical_url';
export type ProductIdentifierType = 'no' | 'gtin' | 'mpn';

export const BRAND_SOURCE_TYPES = {
    VENDOR: 'vendor',
    STORE_NAME: 'store_name',
    PRIMARY_DOMAIN: 'primary_domain',
} as const;

export const PRICE_TYPES = {
    PRICE: 'price',
    COMPARE_AT_PRICE: 'compare_at_price',
} as const;

export const PRODUCT_TYPE_FIELDS = {
    PRODUCT_TYPE: 'product_type',
    CATEGORY_NAME: 'category_name',
    CATEGORY_FULLNAME: 'category_fullname',
    COLLECTIONS: 'collections',
    TAGS: 'tags',
} as const;

export const PRODUCT_URL_SOURCE_TYPES = {
    PRODUCT_URL: 'product_url',
    PRODUCT_CHECKOUT_URL: 'product_checkout_url',
    CANONICAL_URL: 'canonical_url',
} as const;

export const PRODUCT_IDENTIFIER_TYPES = {
    NO: 'no',
    GTIN: 'gtin',
    MPN: 'mpn',
} as const;

export interface TransformerShop {
    shop_name?: string | null;
    domain?: string | null;
}

export interface TransformerFeedMetadata {
    google_merchant_center?: {
        account?: {
            account_id?: string;
        };
        product_category_id?: number | string;
    };
}

export interface TransformerFeed {
    id: string;
    shop_id: string;
    language: string;
    market: string;
    currency: string;
    product_settings?: {
        product_id?: string;
        product_title?: string;
        product_description?: string;
        brand_submission?: BrandSubmissionType;
        product_identifier?: ProductIdentifierType;
        enable_sale_price?: boolean;
    };
    metadata?: TransformerFeedMetadata;
    tracking?: {
        utm_source?: string;
        utm_medium?: string;
        utm_campaign?: string;
    };
}

export interface TransformerProduct {
    id?: string;
    title?: string;
    description?: string;
    vendor?: string | null;
    handle?: string;
    product_type?: string;
    category?: {
        name?: string;
        full_name?: string;
    };
    collections?: {
        collections?: Array<{ title?: string }>;
    };
    tags?: {
        tags?: string[];
    };
    seo?: {
        title?: string;
        description?: string;
    } | null;
}

export interface TransformerProductVariant {
    id: string;
    title?: string;
    display_name?: string;
    sku?: string | null;
    barcode?: string | null;
    price?: number;
    compare_at_price?: number | null;
}

export interface TransformerFeedProductVariant {
    product_id: string;
    variant_id: string;
    field_mapping?: Record<string, unknown>;
}

export interface GoogleMerchantProductTransformInput {
    shop: TransformerShop;
    feed: TransformerFeed;
    product: TransformerProduct;
    variant: TransformerProductVariant;
    mainImage: string | null;
    feedProductVariant: TransformerFeedProductVariant;
}

