import { BRAND_SOURCE_TYPES, PRICE_TYPES, PRODUCT_TYPE_FIELDS, PRODUCT_URL_SOURCE_TYPES, PRODUCT_IDENTIFIER_TYPES, INVENTORY_TYPES, } from '../types/transformer-input.js';
/**
 * Simple encryption utility for UTM tracking
 */
function encryptToString(data) {
    // Simple base64 encoding - replace with your encryption if needed
    return Buffer.from(JSON.stringify(data)).toString('base64');
}
/**
 * Google Merchant Product Transformer
 * Transforms feed, product, variant, and feed-product-variant data into Google Merchant Center Product format
 */
export class GoogleMerchantProductTransformer {
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
    transform(input) {
        const { shop, feed, product, variant, mainImage, feedProductVariant } = input;
        // Build attributes object with required fields first
        const attributes = {
            itemGroupId: this.getItemGroupId(feedProductVariant),
            title: this.getTitle(feed, product, variant, feedProductVariant), // Default
            description: this.getDescription(feed, product, variant, feedProductVariant), // Default
            identifierExists: this.getIdentifierExists(feedProductVariant), // Default
            price: {
                amountMicros: this.getPriceAmountMicros(product, variant, feedProductVariant),
                currencyCode: feed.currency.toUpperCase(),
            },
        };
        // Brand
        const brand = this.getBrand(feed, shop, product, feedProductVariant);
        if (brand) {
            attributes.brand = brand;
        }
        // GTINs and MPN
        const gtinsMpn = this.getGtinsMpn(feed, variant, feedProductVariant);
        if (gtinsMpn) {
            if (gtinsMpn.gtins && gtinsMpn.gtins.length > 0) {
                attributes.gtins = gtinsMpn.gtins;
            }
            if (gtinsMpn.mpn) {
                attributes.mpn = gtinsMpn.mpn;
            }
        }
        // Link
        const link = this.getLink(shop, feed, product, variant, feedProductVariant);
        if (link) {
            attributes.link = link;
        }
        // Canonical Link
        const canonicalLink = this.getCanonicalLink(shop, feed, product);
        if (canonicalLink) {
            attributes.canonicalLink = canonicalLink;
        }
        // Image 
        const imageLink = this.getImageLink(mainImage, feedProductVariant);
        if (imageLink) {
            attributes.imageLink = imageLink;
        }
        // Additional Image Links
        const additionalImageLinks = this.getAdditionalImageLinks(feedProductVariant);
        if (additionalImageLinks.length > 0) {
            attributes.additionalImageLinks = additionalImageLinks;
        }
        // Price
        const price = this.getPrice(variant, feedProductVariant);
        if (price) {
            attributes.price = {
                amountMicros: price,
                currencyCode: feed.currency.toUpperCase(),
            };
        }
        // Sale Price
        const salePrice = this.getSalePrice(feed, variant, feedProductVariant);
        if (salePrice) {
            if (salePrice.salePrice) {
                attributes.salePrice = salePrice.salePrice;
            }
            if (salePrice.salePriceEffectiveDate) {
                attributes.salePriceEffectiveDate = salePrice.salePriceEffectiveDate;
            }
        }
        // Auto Pricing Min Price
        const autoPricingMinPrice = this.getAutoPricingMinPrice(feedProductVariant);
        if (autoPricingMinPrice) {
            // Convert decimal price to micros (multiply by 1,000,000)
            const priceValue = parseFloat(autoPricingMinPrice);
            if (!isNaN(priceValue)) {
                attributes.autoPricingMinPrice = {
                    amountMicros: String(Math.round(priceValue * 1000000)),
                    currencyCode: feed.currency.toUpperCase(),
                };
            }
        }
        // Maximum Retail Price
        const maximumRetailPrice = this.getMaximumRetailPrice(feedProductVariant);
        if (maximumRetailPrice) {
            // Convert decimal price to micros (multiply by 1,000,000)
            const priceValue = parseFloat(maximumRetailPrice);
            if (!isNaN(priceValue)) {
                attributes.maximumRetailPrice = {
                    amountMicros: String(Math.round(priceValue * 1000000)),
                    currencyCode: feed.currency.toUpperCase(),
                };
            }
        }
        // Condition
        const condition = this.getCondition(feedProductVariant);
        if (condition) {
            attributes.condition = condition;
        }
        // Availability
        const availability = this.getAvailability(feed, feedProductVariant);
        if (availability) {
            attributes.availability = availability;
        }
        // Product Type
        const productTypes = this.getProductType(product, feedProductVariant);
        if (productTypes && productTypes.length > 0) {
            attributes.productTypes = productTypes;
        }
        // Google Product Category
        const googleProductCategory = this.getGoogleProductCategory(feed, feedProductVariant);
        if (googleProductCategory) {
            attributes.googleProductCategory = googleProductCategory;
        }
        // Custom Labels
        const customLabels = this.getCustomLabels(feedProductVariant);
        if (customLabels && customLabels.length > 0) {
            if (customLabels[0])
                attributes.customLabel0 = customLabels[0];
            if (customLabels[1])
                attributes.customLabel1 = customLabels[1];
            if (customLabels[2])
                attributes.customLabel2 = customLabels[2];
            if (customLabels[3])
                attributes.customLabel3 = customLabels[3];
            if (customLabels[4])
                attributes.customLabel4 = customLabels[4];
        }
        // Apparel Product Details
        const apparelProductDetails = this.getApparelProductDetails(feedProductVariant);
        if (apparelProductDetails) {
            if (apparelProductDetails.gender)
                attributes.gender = apparelProductDetails.gender;
            if (apparelProductDetails.age_group)
                attributes.ageGroup = apparelProductDetails.age_group;
            if (apparelProductDetails.size)
                attributes.size = apparelProductDetails.size;
            if (apparelProductDetails.size_type)
                attributes.sizeTypes = apparelProductDetails.size_type;
            if (apparelProductDetails.size_system)
                attributes.sizeSystem = apparelProductDetails.size_system;
            if (apparelProductDetails.color)
                attributes.color = apparelProductDetails.color;
            if (apparelProductDetails.material)
                attributes.material = apparelProductDetails.material;
            if (apparelProductDetails.pattern)
                attributes.pattern = apparelProductDetails.pattern;
        }
        // Additional Details
        const additionalDetails = this.getAdditionalDetails(feedProductVariant);
        if (additionalDetails) {
            if (additionalDetails.adult)
                attributes.adult = additionalDetails.adult;
            if (additionalDetails.is_bundle)
                attributes.isBundle = additionalDetails.is_bundle;
            if (additionalDetails.multipack)
                attributes.multipack = additionalDetails.multipack;
            if (additionalDetails.energy_efficiency_class)
                attributes.energyEfficiencyClass = additionalDetails.energy_efficiency_class;
            if (additionalDetails.min_energy_efficiency_class)
                attributes.minEnergyEfficiencyClass = additionalDetails.min_energy_efficiency_class;
            if (additionalDetails.max_energy_efficiency_class)
                attributes.maxEnergyEfficiencyClass = additionalDetails.max_energy_efficiency_class;
            if (additionalDetails.product_highlights)
                attributes.productHighlights = additionalDetails.product_highlights;
            if (additionalDetails.certifications)
                attributes.certifications = additionalDetails.certifications;
        }
        // Shipping and Returns
        const shippingAndReturns = this.getShippingAndReturns(feedProductVariant);
        if (shippingAndReturns) {
            if (shippingAndReturns.shipping_label)
                attributes.shippingLabel = shippingAndReturns.shipping_label;
            if (shippingAndReturns.shipping_weight_value)
                attributes.shippingWeight = {
                    value: shippingAndReturns.shipping_weight_value,
                    unit: shippingAndReturns.shipping_weight_unit,
                };
            if (shippingAndReturns.shipping_length_value)
                attributes.shippingLength = {
                    value: shippingAndReturns.shipping_length_value,
                    unit: shippingAndReturns.shipping_length_unit,
                };
            if (shippingAndReturns.shipping_width_value)
                attributes.shippingWidth = {
                    value: shippingAndReturns.shipping_width_value,
                    unit: shippingAndReturns.shipping_width_unit,
                };
            if (shippingAndReturns.shipping_height_value)
                attributes.shippingHeight = {
                    value: shippingAndReturns.shipping_height_value,
                    unit: shippingAndReturns.shipping_height_unit,
                };
            if (shippingAndReturns.transit_time_label)
                attributes.transitTimeLabel = shippingAndReturns.transit_time_label;
            if (shippingAndReturns.minimun_handling_time)
                attributes.minHandlingTime = shippingAndReturns.minimun_handling_time;
            if (shippingAndReturns.maximum_handling_time)
                attributes.maxHandlingTime = shippingAndReturns.maximum_handling_time;
        }
        // Custom Attributes
        const customAttributes = [];
        // Return Policy Labels
        const returnPolicyLabels = this.getReturnPolicyLabels(feedProductVariant);
        if (returnPolicyLabels && returnPolicyLabels.length > 0) {
            customAttributes.push({
                name: 'return_policy_label',
                value: returnPolicyLabels.join(','),
            });
        }
        // Additional Product Attributes
        const additionalProductAttributes = this.getAdditionalProductAttributes(feedProductVariant);
        if (additionalProductAttributes && Object.keys(additionalProductAttributes).length > 0) {
            for (const [attribute, value] of Object.entries(additionalProductAttributes)) {
                // Convert array values to comma-separated string (Google API doesn't accept arrays in customAttributes.value)
                const finalValue = Array.isArray(value) ? value.join(',') : value;
                customAttributes.push({
                    name: attribute,
                    value: finalValue,
                });
            }
        }
        // Get accountId from feed metadata
        const accountId = this.getAccountId(feed);
        // Build offerId
        const offerId = this.getProductId(feed, feedProductVariant);
        const channel = 'ONLINE';
        const contentLanguage = feed.language.toLowerCase();
        const feedLabel = feed.market.toUpperCase();
        // Build name: accounts/{accountId}/productInputs/{channel}~{contentLanguage}~{feedLabel}~{offerId}
        const name = accountId
            ? `accounts/${accountId}/productInputs/${channel}~${contentLanguage}~${feedLabel}~${offerId}`
            : undefined;
        const result = {
            channel,
            offerId,
            contentLanguage,
            feedLabel,
            attributes: attributes,
            customAttributes: customAttributes,
        };
        // Only include name if it's defined (exactOptionalPropertyTypes: true)
        if (name) {
            result.name = name;
        }
        return result;
    }
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
    getItemGroupId(feedProductVariant) {
        let itemGroupId = feedProductVariant.product_id;
        const fieldMapping = feedProductVariant.field_mapping;
        if (fieldMapping?.product_details) {
            const productDetails = fieldMapping.product_details;
            // item_group_id is alias like {{product_id}} or {{variant_id}} so we need to replace them with the actual values
            if (productDetails.item_group_id) {
                itemGroupId = productDetails.item_group_id
                    .replace('{{product_id}}', feedProductVariant.product_id)
                    .replace('{{variant_id}}', feedProductVariant.variant_id);
            }
        }
        return itemGroupId;
    }
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
    getProductId(feed, feedProductVariant) {
        // If metadata.google_merchant_center.offer_id exists, use that value
        const metadata = feedProductVariant.metadata;
        if (metadata?.google_merchant_center?.offer_id) {
            return metadata.google_merchant_center.offer_id;
        }
        // If feed.product_settings?.product_id exists, use that value
        let productId = feed.product_settings?.product_id;
        if (productId) {
            productId = productId.replace('{{shop_id}}', feed.shop_id);
            productId = productId.replace('{{product_id}}', feedProductVariant.product_id);
            productId = productId.replace('{{variant_id}}', feedProductVariant.variant_id);
        }
        return productId || '';
    }
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
    getTitle(feed, product, variant, feedProductVariant) {
        let title = feed.product_settings?.product_title || '';
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_details) {
                const productDetails = fieldMapping.product_details;
                // product_title is alias like {{product_title}} or {{variant_title}} so we need to replace them with the actual values
                if (productDetails.product_title) {
                    title = productDetails.product_title;
                }
            }
        }
        return title
            .replace('{{product_title}}', product?.title || '')
            .replace('{{variant_title}}', variant.title || '')
            .replace('{{display_name}}', variant.display_name || product?.title || '')
            .replace('{{seo_title}}', product?.seo && typeof product.seo === 'object' && product.seo !== null
            ? product.seo.title || ''
            : '')
            .replace('{{sku}}', variant.sku || '')
            .replace('{{barcode}}', variant.barcode || '');
    }
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
    getDescription(feed, product, variant, feedProductVariant) {
        let description = feed.product_settings?.product_description || '';
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_details) {
                const productDetails = fieldMapping.product_details;
                // description is alias like {{description}} or {{seo_description}} so we need to replace them with the actual values
                if (productDetails.description) {
                    description = productDetails.description;
                }
            }
        }
        return description
            .replace('{{description}}', product?.description || '')
            .replace('{{seo_description}}', product?.seo && typeof product.seo === 'object' && product.seo !== null
            ? product.seo.description || ''
            : '');
    }
    /**
     * Get account ID from feed metadata
     *
     * Access path: feed.metadata?.google_merchant_center?.account?.account_id
     *
     * @param feed - Feed entity containing metadata
     * @returns Account ID string, or empty string if not found
     */
    getAccountId(feed) {
        const metadata = feed.metadata;
        if (!metadata?.google_merchant_center?.account?.account_id) {
            return '';
        }
        return metadata.google_merchant_center.account.account_id;
    }
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
    getPriceAmountMicros(product, variant, feedProductVariant) {
        let priceAmountMicros = 0;
        let priceType = 'price';
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_details) {
                const productDetails = fieldMapping.product_details;
                if (productDetails.price_condition_availability && typeof productDetails.price_condition_availability === 'object' && productDetails.price_condition_availability !== null && productDetails.price_condition_availability.price) {
                    priceType = productDetails.price_condition_availability.price;
                }
            }
        }
        if (priceType === 'price') {
            if (variant.price) {
                priceAmountMicros = variant.price;
            }
        }
        else if (priceType === 'compare_at_price') {
            if (variant.compare_at_price) {
                priceAmountMicros = variant.compare_at_price;
            }
        }
        return String(priceAmountMicros * 1000000);
    }
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
    getBrand(feed, shop, product, feedProductVariant) {
        let brand = null;
        let brandSource = feed.product_settings?.brand_submission || null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_details) {
                const productDetails = fieldMapping.product_details;
                if (productDetails.brand) {
                    brandSource = productDetails.brand;
                }
            }
        }
        if (brandSource) {
            switch (brandSource) {
                case BRAND_SOURCE_TYPES.VENDOR:
                    brand = product?.vendor || null;
                    break;
                case BRAND_SOURCE_TYPES.STORE_NAME:
                    brand = shop.shop_name || null;
                    break;
                case BRAND_SOURCE_TYPES.PRIMARY_DOMAIN:
                    brand = shop.domain || null;
                    break;
                default:
                    brand = null;
                    break;
            }
        }
        return brand || null;
    }
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
    getIdentifierExists(feedProductVariant) {
        let identifierExists = false;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_details) {
                const productDetails = fieldMapping.product_details;
                if (productDetails.product_identifier) {
                    identifierExists = productDetails.product_identifier;
                }
            }
        }
        return identifierExists;
    }
    /**
     * Replace template variables in a string with actual values
     *
     * @param template - Template string with placeholders like {{barcode}}, {{sku}}, etc.
     * @param variant - Product variant entity
     * @param feedProductVariant - Feed product variant containing IDs
     * @returns String with template variables replaced
     */
    replaceTemplateVariables(template, variant, feedProductVariant) {
        return template
            .replace('{{barcode}}', variant.barcode || '')
            .replace('{{sku}}', variant.sku || '')
            .replace('{{product_id}}', feedProductVariant.product_id)
            .replace('{{variant_id}}', feedProductVariant.variant_id);
    }
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
    getGtinsMpn(feed, variant, feedProductVariant) {
        if (!this.getIdentifierExists(feedProductVariant)) {
            return null;
        }
        const productIdentifierType = feed.product_settings?.product_identifier;
        if (!productIdentifierType || productIdentifierType === PRODUCT_IDENTIFIER_TYPES.NO) {
            return null;
        }
        // Extract field mapping values
        const fieldMapping = feedProductVariant.field_mapping;
        const productDetails = fieldMapping?.product_details;
        // Process GTIN template if present
        let gtinTemplate;
        if (productDetails?.gtin) {
            gtinTemplate = this.replaceTemplateVariables(productDetails.gtin, variant, feedProductVariant);
        }
        // Process MPN template if present
        let mpnTemplate;
        if (productDetails?.mpn) {
            mpnTemplate = this.replaceTemplateVariables(productDetails.mpn, variant, feedProductVariant);
        }
        // Filter and validate values
        const validGtins = gtinTemplate && gtinTemplate.trim() !== '' ? [gtinTemplate] : [];
        const validMpn = mpnTemplate && mpnTemplate.trim() !== '' ? mpnTemplate : undefined;
        // Return based on product identifier type
        if (productIdentifierType === PRODUCT_IDENTIFIER_TYPES.GTIN) {
            return validGtins.length > 0
                ? { gtins: validGtins, mpn: null }
                : null;
        }
        if (productIdentifierType === PRODUCT_IDENTIFIER_TYPES.MPN) {
            return validMpn
                ? { gtins: null, mpn: validMpn }
                : null;
        }
        return null;
    }
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
    getLink(shop, feed, product, variant, feedProductVariant) {
        let link = shop.domain + '/products/' + product.handle;
        let linkType = PRODUCT_URL_SOURCE_TYPES.PRODUCT_URL;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.links) {
                const links = fieldMapping.links;
                if (links.product_url) {
                    linkType = links.product_url;
                }
            }
        }
        switch (linkType) {
            case PRODUCT_URL_SOURCE_TYPES.PRODUCT_URL:
                link = link + '?variant=' + variant.id;
                break;
            case PRODUCT_URL_SOURCE_TYPES.PRODUCT_CHECKOUT_URL:
                link = shop.domain + '/cart/' + variant.id + ':1?storefront=true';
                break;
            default:
                break;
        }
        // Add UTM parameters
        link = this.addUtmParameters(link, feed, feedProductVariant);
        return `https://${link}`;
    }
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
    addUtmParameters(link, feed, feedProductVariant) {
        const utmParameters = [];
        if (feed.tracking) {
            if (feed.tracking.utm_source) {
                utmParameters.push('utm_source=' + feed.tracking.utm_source);
            }
            if (feed.tracking.utm_medium) {
                utmParameters.push('utm_medium=' + feed.tracking.utm_medium);
            }
            if (feed.tracking.utm_campaign) {
                utmParameters.push('utm_campaign=' + feed.tracking.utm_campaign);
            }
        }
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.links) {
                const links = fieldMapping.links;
                if (links.utm_source) {
                    utmParameters.push('utm_source=' + links.utm_source);
                }
                if (links.utm_medium) {
                    utmParameters.push('utm_medium=' + links.utm_medium);
                }
                if (links.utm_campaign) {
                    utmParameters.push('utm_campaign=' + links.utm_campaign);
                }
            }
        }
        // Add fdclid parameter
        utmParameters.push('fdclid=' + encryptToString({
            feedId: feed.id,
            shopId: feed.shop_id,
            createdAt: new Date().toISOString(),
        }));
        if (link.includes('?')) {
            return link + '&' + utmParameters.join('&');
        }
        return link + '?' + utmParameters.join('&');
    }
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
    getCanonicalLink(shop, feed, product) {
        let canonicalLink = shop.domain + '/products/' + product.handle;
        return `https://${canonicalLink}`;
    }
    /**
     * Get main image link URL
     *
     * DEFAULT: Uses mainImage from input (passed from controller)
     * OVERRIDE: If field_mapping.product_images.main_image exists, uses that value
     *
     * @param mainImage - Main image URL string from input, or null
     * @returns Main image URL string, or null if not available
     */
    getImageLink(mainImage, feedProductVariant) {
        let imageLink = mainImage;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_images) {
                const productImages = fieldMapping.product_images;
                if (productImages.main_image) {
                    imageLink = productImages.main_image;
                }
            }
        }
        return imageLink;
    }
    /**
     * Get additional image links array
     *
     * DEFAULT: Empty array []
     * OVERRIDE: If field_mapping.product_images.additional_images exists, uses that array
     *
     * @param feedProductVariant - Feed product variant containing field_mapping
     * @returns Array of additional image URLs
     */
    getAdditionalImageLinks(feedProductVariant) {
        let additionalImageLinks = [];
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.product_images) {
                const productImages = fieldMapping.product_images;
                if (productImages.additional_images) {
                    additionalImageLinks = productImages.additional_images;
                }
            }
        }
        return additionalImageLinks;
    }
    getPrice(variant, feedProductVariant) {
        let price = null;
        let priceType = PRICE_TYPES.PRICE;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.price) {
                    priceType = priceConditionAvailability.price;
                }
            }
        }
        if (priceType === PRICE_TYPES.PRICE) {
            price = String((variant.price || 0) * 1000000);
        }
        else if (priceType === PRICE_TYPES.COMPARE_AT_PRICE) {
            price = String((variant.compare_at_price || 0) * 1000000);
        }
        return price;
    }
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
    getSalePrice(feed, variant, feedProductVariant) {
        let enableSalePrice = feed.product_settings?.enable_sale_price ?? false;
        if (!enableSalePrice) {
            return null;
        }
        const fieldMapping = feedProductVariant.field_mapping;
        if (!fieldMapping?.price_condition_availability) {
            return null;
        }
        const priceConditionAvailability = fieldMapping.price_condition_availability;
        // Check if sale price is enabled
        enableSalePrice = priceConditionAvailability.enable_sale_price ?? false;
        if (!enableSalePrice) {
            return null;
        }
        const salePrice = { amountMicros: '', currencyCode: '' };
        const salePriceEffectiveDate = {};
        // Get sale price type
        const salePriceType = priceConditionAvailability.sale_price;
        if (salePriceType) {
            switch (salePriceType) {
                case PRICE_TYPES.PRICE:
                    salePrice.amountMicros = String((variant.price || 0) * 1000000);
                    break;
                case PRICE_TYPES.COMPARE_AT_PRICE:
                    salePrice.amountMicros = String((variant.compare_at_price || 0) * 1000000);
                    break;
            }
        }
        // Get sale dates
        const saleStartDate = priceConditionAvailability.sale_start_date;
        if (saleStartDate) {
            salePriceEffectiveDate.startTime = saleStartDate;
        }
        const saleEndDate = priceConditionAvailability.sale_end_date;
        if (saleEndDate) {
            salePriceEffectiveDate.endTime = saleEndDate;
        }
        return {
            salePrice,
            salePriceEffectiveDate,
        };
    }
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
    getAutoPricingMinPrice(feedProductVariant) {
        let autoPricingMinPrice = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.auto_pricing_min_price) {
                    autoPricingMinPrice = priceConditionAvailability.auto_pricing_min_price;
                }
            }
        }
        return autoPricingMinPrice;
    }
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
    getMaximumRetailPrice(feedProductVariant) {
        let maximumRetailPrice = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.maximum_retail_price) {
                    maximumRetailPrice = priceConditionAvailability.maximum_retail_price;
                }
            }
        }
        return maximumRetailPrice;
    }
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
    getCondition(feedProductVariant) {
        let condition = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.condition) {
                    condition = priceConditionAvailability.condition;
                }
            }
        }
        return condition;
    }
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
    getAvailability(feed, feedProductVariant) {
        let availability = null;
        // DEFAULT: Get from feed.inventory
        if (feed.inventory?.type) {
            if (feed.inventory.type === INVENTORY_TYPES.CUSTOM && feed.inventory.custom_setting) {
                // If type is 'custom', use custom_setting
                availability = feed.inventory.custom_setting;
            }
            else {
                // Otherwise use type directly
                availability = feed.inventory.type;
            }
        }
        // OVERRIDE: Check field_mapping
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.availability) {
                    availability = priceConditionAvailability.availability;
                }
            }
        }
        return availability;
    }
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
    getProductType(product, feedProductVariant) {
        let productTypes = null;
        let productTypeField = PRODUCT_TYPE_FIELDS.PRODUCT_TYPE;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.product_type) {
                    productTypeField = priceConditionAvailability.product_type;
                }
            }
        }
        switch (productTypeField) {
            case PRODUCT_TYPE_FIELDS.PRODUCT_TYPE:
                if (product?.product_type) {
                    productTypes = [product?.product_type];
                }
                break;
            case PRODUCT_TYPE_FIELDS.CATEGORY_NAME:
                if (product?.category?.name) {
                    productTypes = [product?.category?.name];
                }
                break;
            case PRODUCT_TYPE_FIELDS.CATEGORY_FULLNAME:
                if (product?.category?.full_name) {
                    productTypes = [product?.category?.full_name];
                }
                break;
            case PRODUCT_TYPE_FIELDS.COLLECTIONS:
                if (product?.collections?.collections) {
                    productTypes = product?.collections?.collections
                        ?.map(collection => collection.title)
                        .filter((title) => !!title) || [];
                }
                break;
            case PRODUCT_TYPE_FIELDS.TAGS:
                if (product?.tags?.tags) {
                    productTypes = product?.tags?.tags;
                }
                break;
            default:
                productTypes = null;
                break;
        }
        return productTypes;
    }
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
    getGoogleProductCategory(feed, feedProductVariant) {
        let googleProductCategory = feed.metadata?.google_merchant_center?.product_category_id?.toString() || null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.price_condition_availability) {
                const priceConditionAvailability = fieldMapping.price_condition_availability;
                if (priceConditionAvailability.google_product_category) {
                    googleProductCategory = priceConditionAvailability.google_product_category;
                }
            }
        }
        return googleProductCategory;
    }
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
    getCustomLabels(feedProductVariant) {
        const customLabels = [];
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.labels) {
                const labels = fieldMapping.labels;
                if (labels.custom_label_0) {
                    customLabels.push(labels.custom_label_0);
                }
                if (labels.custom_label_1) {
                    customLabels.push(labels.custom_label_1);
                }
                if (labels.custom_label_2) {
                    customLabels.push(labels.custom_label_2);
                }
                if (labels.custom_label_3) {
                    customLabels.push(labels.custom_label_3);
                }
                if (labels.custom_label_4) {
                    customLabels.push(labels.custom_label_4);
                }
            }
        }
        return customLabels;
    }
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
    getApparelProductDetails(feedProductVariant) {
        let apparelProductDetails = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.apparel_product_details) {
                apparelProductDetails = fieldMapping.apparel_product_details;
                if (apparelProductDetails.gender) {
                    apparelProductDetails.gender = apparelProductDetails.gender;
                }
                if (apparelProductDetails.age_group) {
                    apparelProductDetails.age_group = apparelProductDetails.age_group;
                }
                if (apparelProductDetails.size) {
                    apparelProductDetails.size = apparelProductDetails.size;
                }
                if (apparelProductDetails.size_type) {
                    apparelProductDetails.size_type = apparelProductDetails.size_type;
                }
                if (apparelProductDetails.size_system) {
                    apparelProductDetails.size_system = apparelProductDetails.size_system;
                }
                if (apparelProductDetails.color) {
                    apparelProductDetails.color = apparelProductDetails.color;
                }
                if (apparelProductDetails.material) {
                    apparelProductDetails.material = apparelProductDetails.material;
                }
                if (apparelProductDetails.pattern) {
                    apparelProductDetails.pattern = apparelProductDetails.pattern;
                }
            }
        }
        return apparelProductDetails;
    }
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
    getAdditionalDetails(feedProductVariant) {
        let additionalDetails = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.additional_details) {
                additionalDetails = fieldMapping.additional_details;
                if (additionalDetails.adult) {
                    additionalDetails.adult = additionalDetails.adult;
                }
                if (additionalDetails.is_bundle) {
                    additionalDetails.is_bundle = additionalDetails.is_bundle;
                }
                if (additionalDetails.multipack) {
                    additionalDetails.multipack = additionalDetails.multipack;
                }
                if (additionalDetails.energy_efficiency_class) {
                    additionalDetails.energy_efficiency_class = additionalDetails.energy_efficiency_class;
                }
                if (additionalDetails.min_energy_efficiency_class) {
                    additionalDetails.min_energy_efficiency_class = additionalDetails.min_energy_efficiency_class;
                }
                if (additionalDetails.max_energy_efficiency_class) {
                    additionalDetails.max_energy_efficiency_class = additionalDetails.max_energy_efficiency_class;
                }
                if (additionalDetails.product_highlights) {
                    additionalDetails.product_highlights = additionalDetails.product_highlights;
                }
                if (additionalDetails.certifications) {
                    const certifications = [];
                    for (const certification of additionalDetails.certifications) {
                        // Each certification should be a single object with all 4 fields
                        certifications.push({
                            certificationAuthority: certification.authority || '',
                            certificationName: certification.name || '',
                            certificationCode: certification.code || '',
                            certificationValue: certification.value || '',
                        });
                    }
                    additionalDetails.certifications = certifications;
                }
            }
        }
        return additionalDetails;
    }
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
    getShippingAndReturns(feedProductVariant) {
        let shippingAndReturns = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.shipping_and_returns) {
                shippingAndReturns = fieldMapping.shipping_and_returns;
                if (shippingAndReturns.shipping_label) {
                    shippingAndReturns.shipping_label = shippingAndReturns.shipping_label;
                }
                if (shippingAndReturns.shipping_weight_value) {
                    shippingAndReturns.shipping_weight_value = shippingAndReturns.shipping_weight_value;
                }
                if (shippingAndReturns.shipping_weight_unit) {
                    shippingAndReturns.shipping_weight_unit = shippingAndReturns.shipping_weight_unit;
                }
                if (shippingAndReturns.shipping_length_value) {
                    shippingAndReturns.shipping_length_value = shippingAndReturns.shipping_length_value;
                }
                if (shippingAndReturns.shipping_length_unit) {
                    shippingAndReturns.shipping_length_unit = shippingAndReturns.shipping_length_unit;
                }
                if (shippingAndReturns.shipping_width_value) {
                    shippingAndReturns.shipping_width_value = shippingAndReturns.shipping_width_value;
                }
                if (shippingAndReturns.shipping_width_unit) {
                    shippingAndReturns.shipping_width_unit = shippingAndReturns.shipping_width_unit;
                }
                if (shippingAndReturns.shipping_height_value) {
                    shippingAndReturns.shipping_height_value = shippingAndReturns.shipping_height_value;
                }
                if (shippingAndReturns.shipping_height_unit) {
                    shippingAndReturns.shipping_height_unit = shippingAndReturns.shipping_height_unit;
                }
                if (shippingAndReturns.transit_time_label) {
                    shippingAndReturns.transit_time_label = shippingAndReturns.transit_time_label;
                }
                if (shippingAndReturns.minimun_handling_time) {
                    shippingAndReturns.minimun_handling_time = shippingAndReturns.minimun_handling_time;
                }
                if (shippingAndReturns.maximum_handling_time) {
                    shippingAndReturns.maximum_handling_time = shippingAndReturns.maximum_handling_time;
                }
            }
        }
        return shippingAndReturns;
    }
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
    getReturnPolicyLabels(feedProductVariant) {
        let returnPolicyLabels = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.shipping_and_returns) {
                const shippingAndReturns = fieldMapping.shipping_and_returns;
                if (shippingAndReturns.return_policy_labels) {
                    returnPolicyLabels = shippingAndReturns.return_policy_labels;
                }
            }
        }
        return returnPolicyLabels;
    }
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
    getAdditionalProductAttributes(feedProductVariant) {
        let additionalProductAttributes = null;
        if (feedProductVariant.field_mapping) {
            const fieldMapping = feedProductVariant.field_mapping;
            if (fieldMapping.additional_product_attributes) {
                additionalProductAttributes = fieldMapping.additional_product_attributes;
            }
        }
        return additionalProductAttributes;
    }
}
// Export singleton instance
export const googleMerchantProductTransformer = new GoogleMerchantProductTransformer();
//# sourceMappingURL=google-merchant-product.transformer.js.map