import { z } from "astro/zod";
import { config } from "./config";
import { ProductsQuery, ProductByHandleQuery, CreateCartMutation, AddCartLinesMutation, GetCartQuery, RemoveCartLinesMutation } from "./graphql";
import { CartResult, ProductResult } from "./schema";

// Make a request to Shopify's GraphQL API  and return the data object from the response body as JSON data.
const makeShopifyRequest = async (query: string, variables: Record<string, unknown> = {}, buyerIP: string = "") => {
    const isSSR = import.meta.env.SSR;

    const apiUrl = `https://${config.shopify.shop}/api/${config.shopify.apiVersion}/graphql.json`;

    function getOptions() {
        const privateShopifyAccessToken = config.shopify.privateAccessToken;
        const publicShopifyAccessToken = config.shopify.publicAccessToken;

        const options = {
            method: "POST",
            headers: {},
            body: JSON.stringify({ query, variables })
        };
        // Check if the Shopify request is made from the server or the client
        if (isSSR) {
            options.headers = {
                "Content-Type": "application/json",
                "Shopify-Storefront-Private-Token": privateShopifyAccessToken,
                "Shopify-Storefront-Buyer-IP": buyerIP
            };
            return options;
        }
        options.headers = {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": publicShopifyAccessToken
        };

        return options;
    }

    const response = await fetch(apiUrl, getOptions());

    if (!response.ok) {
        const body = await response.text();
        throw new Error(`${response.status} ${body}`);
    }

    const json = await response.json();
    if (json.errors) {
        throw new Error(json.errors.map((e: Error) => e.message).join("\n"));
    }

    return json.data;
};

// process product variants
const processProductData = (product: any): z.infer<typeof ProductResult> => {
    if (!product) return null;

    const colorOption = product.options?.find((option: any) => option.name.toLowerCase() === "color");
    const sizeOption = product.options?.find((option: any) => option.name.toLowerCase() === "size");

    const colors = colorOption ? colorOption.values : [];
    const sizes = sizeOption ? sizeOption.values : [];

    const processedVariants =
        product.variants?.nodes?.map((variant: any) => {
            const color = variant.selectedOptions?.find((option: any) => option.name.toLowerCase() === "color")?.value;
            const size = variant.selectedOptions?.find((option: any) => option.name.toLowerCase() === "size")?.value;

            return {
                ...variant,
                color,
                size
            };
        }) || [];

    const processedProduct = {
        ...product,
        colors,
        sizes,
        variants: {
            nodes: processedVariants
        }
    };

    // Use Zod to parse and validate the processed product
    return ProductResult.parse(processedProduct);
};

// Get all products or a limited number of products (default: 10)
export const getAllProducts = async (options: { limit?: number; buyerIP: string }) => {
    const { limit = 10, buyerIP } = options;

    try {
        const data = await makeShopifyRequest(ProductsQuery, { first: limit }, buyerIP);
        const { products } = data;

        if (!products || !products.edges) {
            throw new Error("No products found or invalid data structure");
        }

        const productsList = products.edges.map((edge: any) => edge.node);
        const processedProducts = productsList.map(processProductData).filter(Boolean);

        return processedProducts;
    } catch (error) {
        console.error("Error in getAllProducts:", error);
        return []; // Return an empty array if there's an error
    }
};

// Get a single product by handle
export const getProductByHandle = async (handle: string, buyerIP: string = "") => {
    const data = await makeShopifyRequest(ProductByHandleQuery, { handle, buyerIP });
    const { product } = data;

    if (!product) {
        throw new Error("No product found");
    }

    const productResult = ProductResult.parse(product);

    return processProductData(productResult);
};

// Create a cart and add a line item to it and return the cart object
export const createCart = async (id: string, quantity: number) => {
    const data = await makeShopifyRequest(CreateCartMutation, { id, quantity });
    const { cartCreate } = data;
    const { cart } = cartCreate;
    const parsedCart = CartResult.parse(cart);

    return parsedCart;
};

// Add a line item to an existing cart (by ID) and return the updated cart object
export const addCartLines = async (id: string, merchandiseId: string, quantity: number) => {
    const data = await makeShopifyRequest(AddCartLinesMutation, {
        cartId: id,
        merchandiseId,
        quantity
    });
    const { cartLinesAdd } = data;
    const { cart } = cartLinesAdd;

    const parsedCart = CartResult.parse(cart);

    return parsedCart;
};

// Remove line items from an existing cart (by IDs) and return the updated cart object
export const removeCartLines = async (id: string, lineIds: string[]) => {
    const data = await makeShopifyRequest(RemoveCartLinesMutation, {
        cartId: id,
        lineIds
    });
    const { cartLinesRemove } = data;
    const { cart } = cartLinesRemove;
    const parsedCart = CartResult.parse(cart);

    return parsedCart;
};

// Get a cart by its ID and return the cart object
export const getCart = async (id: string) => {
    const data = await makeShopifyRequest(GetCartQuery, { id });

    const { cart } = data;
    const parsedCart = CartResult.parse(cart);

    // Process product data for each item in the cart
    const processedCart = {
        ...parsedCart,
        lines: {
            ...parsedCart.lines,
            nodes: parsedCart.lines.nodes.map((item) => ({
                ...item,
                merchandise: processProductData(item.merchandise)
            }))
        }
    };

    return processedCart;
};
