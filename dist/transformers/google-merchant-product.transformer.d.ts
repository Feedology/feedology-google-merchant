import type { ProductInput } from '../services/merchant-product.service.js';
import type { GoogleMerchantProductTransformInput } from '../types/transformer-input.js';
/**
 * Google Merchant Product Transformer
 * Transforms feed, product, variant, and feed-product-variant data into Google Merchant Center Product format
 */
export declare class GoogleMerchantProductTransformer {
    /**
     * Transform input data into Google Merchant Center Product format
     *
     * Payload Structure:
     * {
     *   name: string, // accounts/{accountId}/productInputs/{channel}~{contentLanguage}~{feedLabel}~{offerId}
     *   channel: "ONLINE", // Always "ONLINE"
     *   offerId: string, // Composite: feed_id_product_id_variant_id
     *   contentLanguage: string, // Feed language, 2 lowercase chars (ISO 639-1)
     *   feedLabel: string, // Feed market, 2 uppercase chars (ISO 3166-1)
     *   attributes: { ... }, // All product attributes
     *   customAttributes: [{ name: string, value: string }], // Additional attributes + return_policy_labels
     * }
     *
     * Mapping Rules:
     * - DEFAULT: Fill data from feed, product, and variant
     * - OVERRIDE: If field_mapping exists, use field_mapping values to override defaults
     *
     * 1. Build top-level fields (name, channel, offerId, contentLanguage, feedLabel, dataSource)
     * 2. Extract field_mapping from feedProductVariant (optional)
     * 3. For each field:
     *    a. Set default value from feed/product/variant
     *    b. If field_mapping has value for this field, override with field_mapping value
     * 4. Map product_details (itemGroupId, title, brand, description, identifierExists, gtins, mpn)
     * 5. Map links (link with UTM params, canonicalLink)
     * 6. Map product_images (imageLink, additionalImageLinks)
     * 7. Map price_condition_availability (price, salePrice, salePriceEffectiveDate, autoPricingMinPrice, maximumRetailPrice, condition, availability, productTypes, googleProductCategory)
     * 8. Map labels (customLabel0-4)
     * 9. Map apparel_product_details (gender, ageGroup, size, sizeTypes, sizeSystem, color, material, pattern)
     * 10. Map additional_details (adult, isBundle, multipack, energyEfficiencyClass, minEnergyEfficiencyClass, maxEnergyEfficiencyClass, productHighlights, certifications)
     * 11. Map shipping_and_returns (shippingLabel, shippingWeight, shippingLength, shippingWidth, shippingHeight, transitTimeLabel, minHandlingTime, maxHandlingTime)
     * 12. Map additional_product_attributes to customAttributes array
     * 13. Map return_policy_labels to customAttributes array
     * 14. Handle variant_id = 0 case (product-level, not variant-specific)
     * 15. Convert prices to amountMicros (price * 1,000,000)
     * 16. Format currency codes (3 uppercase chars, ISO 4217)
     * 17. Format language codes (2 lowercase chars, ISO 639-1)
     * 18. Format market codes (2 uppercase chars, ISO 3166-1)
     * 19. Conditional fields: gtins/mpn only when identifierExists=true, salePrice only when enable_sale_price=true
     */
    /**
     * Transform input data into Google Merchant Center Product format
     *
     * @param input - Input data containing shop, feed, product, variant, mainImage, and feedProductVariant
     * @returns Google Merchant Product object ready for API submission
     *
     * Mapping Rules:
     * - DEFAULT: Fill data from feed, product, and variant
     * - OVERRIDE: If field_mapping exists, use field_mapping values to override defaults
     * - CONDITIONAL: Some fields only appear when certain conditions are met (e.g., gtins/mpn when identifierExists=true)
     */
    transform(input: GoogleMerchantProductTransformInput): ProductInput;
    /**
     * Get Item Group ID for the product
     *
     * DEFAULT: Uses product_id as string
     * OVERRIDE: If field_mapping.product_details.item_group_id exists, uses that value
     *           Supports alias templates: {{product_id}}, {{variant_id}}
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Item Group ID string
     */
    private getItemGroupId;
    /**
     * Get product ID
     *
     * Priority:
     * 1) feedProductVariant.metadata.google_merchant_center.offer_id (if present) → return immediately
     * 2) DEFAULT: feed.product_settings?.product_id → apply template
     *    OVERRIDE: field_mapping.product_details?.product_id (if provided in mapping) → apply template
     *    - Supports aliases: {{shop_id}}, {{product_id}}, {{variant_id}}
     * 3) If none are set, return empty string
     *
     * @param feed - Feed entity containing product settings
     * @param feedProductVariant - Feed-product-variant with possible metadata overrides
     * @returns Product ID string, or empty string if not set
     */
    private getProductId;
    /**
     * Get product title
     *
     * DEFAULT: Uses product.title or variant.title (fallback)
     * OVERRIDE: If field_mapping.product_details.product_title exists, uses that value
     *           Supports alias templates: {{product_title}}, {{variant_title}}, {{display_name}},
     *           {{seo_title}}, {{sku}}, {{barcode}}
     *
     * @param product - Product entity
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Product title string
     */
    private getTitle;
    /**
     * Get product description
     *
     * DEFAULT: Uses product.description
     * OVERRIDE: If field_mapping.product_details.description exists, uses that value
     *           Supports alias templates: {{description}}, {{seo_description}}
     *
     * @param product - Product entity
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Product description string
     */
    private getDescription;
    /**
     * Get account ID from feed metadata
     *
     * Access path: feed.metadata?.google_merchant_center?.account?.account_id
     *
     * @param feed - Feed entity containing metadata
     * @returns Account ID string, or empty string if not found
     */
    private getAccountId;
    /**
     * Get price in micros (price * 1,000,000) for Google Merchant Center
     *
     * DEFAULT: Uses variant.price
     * OVERRIDE: If field_mapping.price_condition_availability.price exists, uses that source type
     *           Supports price types: 'price', 'compare_at_price'
     *           Supports alias templates: {{price}}, {{compare_at_price}}
     *
     * @param product - Product entity
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Price in micros as string (e.g., "1000000" for $1.00)
     */
    private getPriceAmountMicros;
    /**
     * Get product brand
     *
     * DEFAULT: Uses product.vendor, shop.shop_name, or shop.domain (fallback order)
     * OVERRIDE: If field_mapping.product_details.brand exists, uses that value
     *           Supports alias templates: {{vendor}}, {{store_name}}, {{primary_domain}}
     *
     * @param shop - Shop entity
     * @param product - Product entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Brand string, or null if not set
     */
    private getBrand;
    /**
     * Get product identifier exists flag
     *
     * DEFAULT: false
     * OVERRIDE: If field_mapping.product_details.product_identifier exists, uses that value
     *
     * Note: When true, gtins and mpn fields become required/conditional
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Boolean indicating if product identifier exists
     */
    private getIdentifierExists;
    /**
     * Replace template variables in a string with actual values
     *
     * @param template - Template string with placeholders like {{barcode}}, {{sku}}, etc.
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing IDs
     * @returns String with template variables replaced
     */
    private replaceTemplateVariables;
    /**
     * Get GTINs and MPN for product identification
     *
     * CONDITIONAL: Only returns values when identifierExists = true
     * DEFAULT: Uses variant.barcode or variant.sku (fallback)
     * OVERRIDE: If field_mapping.product_details.gtin/mpn exists, uses that value
     *           Supports alias templates: {{barcode}}, {{sku}}, {{product_id}}, {{variant_id}}
     *
     * Filters out empty strings from gtins array and mpn before returning.
     * Only returns fields that have non-empty values based on product_identifier type.
     *
     * @param feed - Feed entity containing product settings
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Object with gtins array and mpn string, or null if identifierExists is false or product_identifier is not set
     */
    private getGtinsMpn;
    /**
     * Get product link URL with UTM parameters
     *
     * DEFAULT: Constructs URL from shop.domain + '/products/' + product.handle
     *          Adds ?variant={variant_id} if variant exists
     * OVERRIDE: If field_mapping.links.product_url exists, uses that source type:
     *           - 'product_url': Standard product page URL
     *           - 'product_checkout_url': Direct checkout URL (/cart/{variant_id}:1)
     *           - 'canonical_url': Canonical URL
     *
     * UTM parameters are added from:
     * 1. feed.tracking (utm_source, utm_medium, utm_campaign)
     * 2. field_mapping.links (overrides feed.tracking if present)
     *
     * @param shop - Shop entity
     * @param feed - Feed entity
     * @param product - Product entity
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Full product URL with https:// prefix and UTM parameters
     */
    private getLink;
    /**
     * Add UTM parameters to a link URL
     *
     * UTM parameters are collected from:
     * 1. feed.tracking (utm_source, utm_medium, utm_campaign)
     * 2. field_mapping.links (overrides feed.tracking values if present)
     *
     * @param link - Base URL to add UTM parameters to
     * @param feed - Feed entity containing tracking information
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns URL with UTM parameters appended (if any)
     */
    private addUtmParameters;
    /**
     * Get canonical link URL
     *
     * DEFAULT: Constructs URL from shop.domain + '/products/' + product.handle
     *          Adds ?variant={variant_id} if variant exists
     * OVERRIDE: If field_mapping.links.canonical_link exists, uses that value
     *
     * @param shop - Shop entity
     * @param feed - Feed entity
     * @param product - Product entity
     * @param variant - Product variant entity
     * @returns Canonical URL with https:// prefix
     */
    private getCanonicalLink;
    /**
     * Get main image link URL
     *
     * DEFAULT: Uses mainImage from input (passed from controller)
     * OVERRIDE: If field_mapping.product_images.main_image exists, uses that value
     *
     * @param mainImage - Main image URL string from input, or null
     * @returns Main image URL string, or null if not available
     */
    private getImageLink;
    /**
     * Get additional image links array
     *
     * DEFAULT: Empty array []
     * OVERRIDE: If field_mapping.product_images.additional_images exists, uses that array
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Array of additional image URLs
     */
    private getAdditionalImageLinks;
    private getPrice;
    /**
     * Get sale price and effective dates
     *
     * CONDITIONAL: Only returns values when enable_sale_price = true
     * DEFAULT: null (sale price not enabled)
     * OVERRIDE: If field_mapping.price_condition_availability.sale_price exists, uses that value
     *           Supports alias templates: {{price}}, {{compare_at_price}}
     *
     * Returns both salePrice (amount in micros) and salePriceEffectiveDate (start/end times).
     * Sale dates are required if salePrice is present.
     *
     * @param feed - Feed entity (for currency code)
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Object with salePrice and salePriceEffectiveDate, or null if not enabled
     */
    private getSalePrice;
    /**
     * Get auto pricing minimum price
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.price_condition_availability.auto_pricing_min_price exists, uses that value
     *
     * Note: Value should be in micros format (price * 1,000,000)
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Auto pricing min price in micros as string, or null if not set
     */
    private getAutoPricingMinPrice;
    /**
     * Get maximum retail price
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.price_condition_availability.maximum_retail_price exists, uses that value
     *
     * Note: Value should be in micros format (price * 1,000,000)
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Maximum retail price in micros as string, or null if not set
     */
    private getMaximumRetailPrice;
    /**
     * Get product condition
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.price_condition_availability.condition exists, uses that value
     *
     * Valid values: 'new', 'used', 'refurbished'
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Product condition string, or null if not set
     */
    private getCondition;
    /**
     * Get product availability
     *
     * DEFAULT: Uses feed.inventory.type or feed.inventory.custom_setting
     *   - If feed.inventory.type === 'custom', uses feed.inventory.custom_setting
     *   - Otherwise, uses feed.inventory.type
     * OVERRIDE: If field_mapping.price_condition_availability.availability exists, uses that value
     *
     * Valid values: 'in stock', 'out of stock', 'preorder', 'backorder'
     *
     * @param feed - Feed entity containing inventory settings
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Product availability string, or null if not set
     */
    private getAvailability;
    /**
     * Get product type array
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.price_condition_availability.product_type exists, uses that array
     *
     * Note: Array should contain only 1 item according to Google Merchant Center spec
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Product type array with 1 item, or null if not set
     */
    private getProductType;
    /**
     * Get Google product category ID
     *
     * DEFAULT: Uses feed.metadata?.google_merchant_center?.product_category_id
     * OVERRIDE: If field_mapping.price_condition_availability.google_product_category exists, uses that value
     *
     * @param feed - Feed entity containing metadata
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Google product category ID as string, or null if not set
     */
    private getGoogleProductCategory;
    /**
     * Get custom labels array (customLabel0-4)
     *
     * DEFAULT: Empty array []
     * OVERRIDE: If field_mapping.labels.custom_label_0-4 exist, collects them into array
     *
     * Returns array with up to 5 custom labels (indices 0-4)
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Array of custom label strings, or null if none are set
     */
    private getCustomLabels;
    /**
     * Get apparel product details
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.apparel_product_details exists, uses that object
     *
     * Fields included: gender, age_group, size, size_type, size_system, color, material, pattern
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Apparel product details object, or null if not set
     */
    private getApparelProductDetails;
    /**
     * Get additional product details
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.additional_details exists, uses that object
     *
     * Fields included: adult, is_bundle, multipack, energy_efficiency_class,
     * min_energy_efficiency_class, max_energy_efficiency_class, product_highlights, certifications
     *
     * Certifications are transformed from {authority, name, code, value} format to
     * {certificationAuthority, certificationName, certificationCode, certificationValue} format.
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Additional details object, or null if not set
     */
    private getAdditionalDetails;
    /**
     * Get shipping and returns information
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.shipping_and_returns exists, uses that object
     *
     * Fields included: shipping_label, shipping_weight_value/unit, shipping_length_value/unit,
     * shipping_width_value/unit, shipping_height_value/unit, transit_time_label,
     * minimun_handling_time, maximum_handling_time
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Shipping and returns object, or null if not set
     */
    private getShippingAndReturns;
    /**
     * Get return policy labels array
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.shipping_and_returns.return_policy_labels exists, uses that array
     *
     * These labels are added to customAttributes array with name 'return_policy_label'
     * and value as comma-separated string of all labels.
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Array of return policy label strings, or null if not set
     */
    private getReturnPolicyLabels;
    /**
     * Get additional product attributes
     *
     * DEFAULT: null
     * OVERRIDE: If field_mapping.additional_product_attributes exists, uses that object
     *
     * These attributes are added to customAttributes array.
     * Each key-value pair becomes a customAttribute with name=key and value=value.
     * Values can be strings or string arrays (for multi-value attributes).
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Additional product attributes object, or null if not set
     */
    private getAdditionalProductAttributes;
}
export declare const googleMerchantProductTransformer: GoogleMerchantProductTransformer;
//# sourceMappingURL=google-merchant-product.transformer.d.ts.map