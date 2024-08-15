import { z } from "zod";

export const configSchema = z.object({
    shopifyShop: z.string(),
    publicShopifyAccessToken: z.string(),
    privateShopifyAccessToken: z.string(),
    apiVersion: z.string()
});

export const MoneyV2Result = z.object({
    amount: z.string(),
    currencyCode: z.string()
});

export const ImageResult = z
    .object({
        altText: z.string().nullable().optional(),
        url: z.string(),
        width: z.number().positive().int(),
        height: z.number().positive().int()
    })
    .nullable();

export const CartItemResult = z.object({
    id: z.string(),
    cost: z.object({
        amountPerQuantity: MoneyV2Result,
        subtotalAmount: MoneyV2Result,
        totalAmount: MoneyV2Result
    }),
    merchandise: z.object({
        id: z.string(),
        title: z.string(),
        product: z.object({
            title: z.string(),
            handle: z.string()
        }),
        image: ImageResult.nullable()
    }),
    quantity: z.number().positive().int()
});

export const CartResult = z
    .object({
        id: z.string(),
        cost: z.object({
            subtotalAmount: MoneyV2Result
        }),
        checkoutUrl: z.string(),
        totalQuantity: z.number().int(),
        lines: z.object({
            nodes: z.array(CartItemResult)
        })
    })
    .nullable();

export const OptionResult = z.object({
    name: z.string(),
    values: z.array(z.string())
});

export const SelectedOptionResult = z.object({
    name: z.string(),
    value: z.string()
});

export const VariantResult = z.object({
    id: z.string(),
    title: z.string().optional(),
    availableForSale: z.boolean().optional(),
    quantityAvailable: z.number().int().optional(),
    selectedOptions: z
        .array(
            z.object({
                name: z.string(),
                value: z.string()
            })
        )
        .optional(),
    price: MoneyV2Result.optional(),
    color: z.string().optional(),
    size: z.string().optional()
});

export const ProductResult = z.object({
    id: z.string(),
    title: z.string(),
    handle: z.string(),
    description: z.string().optional(),
    descriptionHtml: z.string().optional(),
    options: z
        .array(
            z.object({
                name: z.string(),
                values: z.array(z.string())
            })
        )
        .optional(),
    images: z
        .object({
            nodes: z.array(ImageResult.optional())
        })
        .optional(),
    variants: z
        .object({
            nodes: z.array(VariantResult)
        })
        .optional(),
    featuredImage: ImageResult.nullable().optional(),
    colors: z.array(z.string()).optional(),
    sizes: z.array(z.string()).optional()
});
