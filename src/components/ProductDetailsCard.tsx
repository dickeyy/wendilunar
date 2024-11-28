import React, { useState, useEffect } from "react";
import { useReward } from "react-rewards";
import { ShoppingBasketIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { addCartItem } from "@/stores/cart-store";

export default function ProductDetailsCard({ product }) {
    const { reward, isAnimating } = useReward("rewardId", "confetti", {
        elementCount: 100,
        spread: 100
    });

    const [selectedColor, setSelectedColor] = useState("");
    const [selectedSize, setSelectedSize] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [isProductAvailable, setIsProductAvailable] = useState(true);

    // Helper function to safely get variants
    const getVariants = () => {
        return product?.variants?.nodes || [product]; // Fallback to product itself if no variants
    };

    // Helper function to safely get variant properties
    const getVariantProperties = () => {
        const variants = getVariants();
        const colors = [...new Set(variants.map((v) => v.color).filter(Boolean))];
        const sizes = [...new Set(variants.map((v) => v.size).filter(Boolean))];
        return { colors, sizes };
    };

    useEffect(() => {
        const variants = getVariants();
        if (variants.length > 0) {
            const firstAvailableVariant =
                variants.find((variant) => variant.availableForSale !== false) || variants[0];

            setIsProductAvailable(firstAvailableVariant.availableForSale !== false);
            setSelectedVariant(firstAvailableVariant);
            setSelectedColor(firstAvailableVariant.color || "");
            setSelectedSize(firstAvailableVariant.size || "");
        }
    }, [product]);

    useEffect(() => {
        const variants = getVariants();
        const { sizes } = getVariantProperties();

        // If we have no color/size selections and only one variant, use that
        if (variants.length === 1) {
            setSelectedVariant(variants[0]);
            return;
        }

        const variant = variants.find(
            (v) =>
                (!v.color || v.color === selectedColor) &&
                (!v.size || sizes.length === 0 || v.size === selectedSize)
        );
        setSelectedVariant(variant || variants[0]);
    }, [selectedColor, selectedSize, product]);

    const handleAddToBasket = async () => {
        if (isLoading || !selectedVariant) return;

        setIsLoading(true);
        reward();

        await addCartItem({
            id: selectedVariant.id,
            quantity: quantity
        }).then(() => {
            setIsLoading(false);
        });
    };

    const { colors, sizes } = getVariantProperties();

    return (
        <Card className="flex h-fit w-full flex-col bg-card/60">
            <CardHeader>
                <CardTitle className="text-2xl font-extrabold">{product.title}</CardTitle>
                <CardDescription className="text-md font-bold">
                    {isProductAvailable ? (
                        "$" + parseFloat(selectedVariant?.price?.amount || 0).toFixed(2)
                    ) : (
                        <p className="gap-2 text-red-500">
                            <span className="mr-2 line-through">
                                ${parseFloat(selectedVariant?.price?.amount || 0).toFixed(2)}
                            </span>{" "}
                            {isProductAvailable ? "Selected variant out of stock" : "Out of stock"}
                        </p>
                    )}
                </CardDescription>
            </CardHeader>
            <CardContent className="font-medium">
                <div className="flex flex-col items-start gap-8">
                    <div
                        className="prose prose-sm max-w-none text-sm font-medium text-foreground/80"
                        dangerouslySetInnerHTML={{ __html: product.descriptionHtml || "" }}
                    />

                    <div className="flex w-full flex-col items-start gap-4">
                        {colors.length > 0 && (
                            <div className="flex w-full flex-col items-start gap-1">
                                <p className="text-sm font-medium text-foreground/80">Color</p>
                                <Select
                                    value={selectedColor}
                                    onValueChange={setSelectedColor}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colors.map((color, index) => (
                                            <SelectItem
                                                key={String((color as any) + index)}
                                                value={color as any}
                                            >
                                                {color as any}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {sizes.length > 0 && (
                            <div className="flex w-full flex-col items-start gap-1">
                                <p className="text-sm font-medium text-foreground/80">Size</p>
                                <Select
                                    value={selectedSize}
                                    onValueChange={setSelectedSize}
                                    disabled={isLoading}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sizes.map((size, index) => (
                                            <SelectItem
                                                key={String((size as any) + index)}
                                                value={size as any}
                                            >
                                                {size as any}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex w-full flex-col items-start gap-1">
                            <p className="text-sm font-medium text-foreground/80">Quantity</p>
                            <div
                                aria-disabled={isLoading}
                                className="flex h-fit w-fit flex-row items-center gap-2 rounded-md border border-input py-0 shadow-sm disabled:bg-opacity-50"
                            >
                                <Button
                                    variant="ghost"
                                    className="hover:bg-muted"
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    disabled={quantity <= 1 || isLoading}
                                    size="sm"
                                >
                                    -
                                </Button>
                                <Input
                                    type="number"
                                    onChange={(e) => {
                                        const q = Math.min(
                                            100,
                                            Math.max(1, parseInt(e.target.value) || 1)
                                        );
                                        setQuantity(q);
                                    }}
                                    value={quantity}
                                    disabled={isLoading}
                                    min={1}
                                    max={100}
                                    className="h-fit rounded-none border-0 bg-transparent py-0 text-center shadow-none focus-visible:outline-none focus-visible:ring-0"
                                />
                                <Button
                                    variant="ghost"
                                    className="hover:bg-muted"
                                    onClick={() => setQuantity(Math.min(100, quantity + 1))}
                                    disabled={quantity >= 100 || isLoading}
                                    size="sm"
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button
                    className="w-full font-bold"
                    size="lg"
                    disabled={isLoading || !isProductAvailable || isAnimating}
                    onClick={handleAddToBasket}
                >
                    <span id="rewardId" />
                    {isProductAvailable ? (
                        <>
                            <ShoppingBasketIcon className="mr-2 inline-block size-5 disabled:cursor-not-allowed" />
                            <p>
                                Add {quantity} Item{quantity > 1 ? "s" : ""} to Basket
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
