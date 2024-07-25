import type { z } from "astro/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import VariantSelector from "./VariantSelector";
import type { ProductResult } from "@/lib/schema";
import { ShoppingBasketIcon } from "lucide-react";
import { useState } from "react";
import { useReward } from "react-rewards";
import { addCartItem } from "@/stores/cart-store";

export default function ProductDetailsCard({
    product
}: {
    product: z.infer<typeof ProductResult>;
}) {
    const { reward, isAnimating } = useReward("rewardId", "confetti", {
        elementCount: 100,
        spread: 100
    });

    const [variant, setVariant] = useState(product?.variants?.nodes[0]);
    const [quantity, setQuantity] = useState<number>(1);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddToBasket = async () => {
        if (isLoading) return;
        if (!variant) return;

        setIsLoading(true);
        reward();

        await addCartItem({
            id: variant?.id as string,
            quantity: quantity
        }).then(() => {
            setIsLoading(false);
        });

        setIsLoading(false);
    };

    return (
        <Card className="flex h-fit w-full flex-col bg-zinc-400/20">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold">{product?.title}</CardTitle>
                <CardDescription className="text-md">
                    {variant?.availableForSale ? (
                        "$" + parseFloat(variant?.price?.amount ?? "0.00").toFixed(2)
                    ) : (
                        <p className="gap-2 text-red-500">
                            <span className="mr-2 line-through">
                                $ {parseFloat(variant?.price?.amount ?? "0.00").toFixed(2)}
                            </span>{" "}
                            Out of stock
                        </p>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col items-start gap-8">
                    <div
                        className="prose prose-sm max-w-none text-sm font-normal text-foreground/80"
                        dangerouslySetInnerHTML={{ __html: product?.descriptionHtml || "" }}
                    />

                    <div className="flex w-full flex-col items-start gap-4">
                        <div className="flex w-full flex-col items-start gap-1">
                            <p className="text-sm font-light text-foreground/80">Quantity</p>
                            <div
                                aria-disabled={isLoading}
                                className="flex w-fit flex-row items-center gap-2 rounded-md border bg-input/20 disabled:bg-opacity-50"
                            >
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        if (quantity <= 1) return;
                                        setQuantity(quantity - 1);
                                    }}
                                    disabled={quantity <= 1 || isLoading}
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    onChange={(e) => {
                                        let q = parseInt(e.target.value);
                                        if (q <= 0) q = 1;
                                        if (q > 100) q = 100;
                                        setQuantity(q);
                                    }}
                                    value={quantity}
                                    disabled={isLoading}
                                    min={1}
                                    max={100}
                                    className="rounded-none border-0 bg-transparent text-center focus-visible:outline-none focus-visible:ring-0"
                                />
                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        if (quantity >= 100) return;
                                        setQuantity(quantity + 1);
                                    }}
                                    disabled={quantity >= 100 || isLoading}
                                >
                                    +
                                </Button>
                            </div>
                        </div>

                        <div className="flex w-full flex-col items-start gap-1">
                            {product?.variants?.nodes && product?.variants?.nodes.length > 1 && (
                                <>
                                    <p className="text-sm font-light text-foreground/80">
                                        Select a variant
                                    </p>
                                    <VariantSelector
                                        disabled={isLoading}
                                        selectedVariant={variant}
                                        product={product}
                                        setSelectedVariant={setVariant}
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="mt-8">
                <Button
                    className="w-full"
                    size="lg"
                    disabled={isLoading || variant?.availableForSale === false || isAnimating}
                    onClick={handleAddToBasket}
                >
                    <span id="rewardId" />

                    {variant?.availableForSale ? (
                        <>
                            <ShoppingBasketIcon className="mr-2 inline-block size-5 disabled:cursor-not-allowed" />
                            <p>
                                Add {isNaN(quantity) ? "1" : quantity} Item{quantity > 1 ? "s" : ""}{" "}
                                to Basket
                            </p>
                        </>
                    ) : (
                        "Out of stock"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
