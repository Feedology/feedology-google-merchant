/**
 * Minimal types for transformer input
 * These types define only the fields needed by the transformer
 */
export const BRAND_SOURCE_TYPES = {
    VENDOR: 'vendor',
    STORE_NAME: 'store_name',
    PRIMARY_DOMAIN: 'primary_domain',
};
export const PRICE_TYPES = {
    PRICE: 'price',
    COMPARE_AT_PRICE: 'compare_at_price',
};
export const PRODUCT_TYPE_FIELDS = {
    PRODUCT_TYPE: 'product_type',
    CATEGORY_NAME: 'category_name',
    CATEGORY_FULLNAME: 'category_fullname',
    COLLECTIONS: 'collections',
    TAGS: 'tags',
};
export const PRODUCT_URL_SOURCE_TYPES = {
    PRODUCT_URL: 'product_url',
    PRODUCT_CHECKOUT_URL: 'product_checkout_url',
    CANONICAL_URL: 'canonical_url',
};
export const PRODUCT_IDENTIFIER_TYPES = {
    NO: 'no',
    GTIN: 'gtin',
    MPN: 'mpn',
};
/**
 * Inventory Types
 * How to handle inventory
 */
export const INVENTORY_TYPES = {
    SHOPIFY_INVENTORY: 'shopify_inventory',
    OUT_OF_STOCK: 'out_of_stock',
    CUSTOM: 'custom',
};
/**
 * Inventory Custom Setting Types
 * Available options when inventory type is 'custom'
 */
export const INVENTORY_CUSTOM_SETTINGS = {
    IN_STOCK: 'in_stock',
    OUT_OF_STOCK: 'out_of_stock',
    PREORDER: 'preorder',
    BACKORDER: 'backorder',
};
//# sourceMappingURL=transformer-input.js.map