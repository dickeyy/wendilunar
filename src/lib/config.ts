import { LATEST_API_VERSION } from "@shopify/shopify-api";

export const config = {
    shopify: {
        apiVersion: LATEST_API_VERSION,

        shop: import.meta.env.PUBLIC_SHOPIFY_SHOP,
        publicAccessToken: import.meta.env.PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN,
        privateAccessToken: import.meta.env.PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN
    }
};
