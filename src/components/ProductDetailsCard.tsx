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

    useEffect(() => {
        if (product.variants.nodes.length > 0) {
            const firstAvailableVariant = product.variants.nodes.find((variant) => variant.availableForSale);
            if (firstAvailableVariant) {
                setSelectedVariant(firstAvailableVariant);
                setSelectedColor(firstAvailableVariant.color || "");
                setSelectedSize(firstAvailableVariant.size || "");
            } else {
                setSelectedVariant(product.variants.nodes[0]);
                setSelectedColor(product.variants.nodes[0].color || "");
                setSelectedSize(product.variants.nodes[0].size || "");
            }
        }
    }, [product]);

    useEffect(() => {
        const variant = product.variants.nodes.find((v) => v.color === selectedColor && (product.sizes.length === 0 || v.size === selectedSize));
        setSelectedVariant(variant || null);
    }, [selectedColor, selectedSize, product.variants.nodes, product.sizes]);

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

    const isProductAvailable = product.variants.nodes.some((variant) => variant.availableForSale);

    return (
        <Card className="flex h-fit w-full flex-col bg-card/60">
            <CardHeader>
                <CardTitle className="text-2xl font-extrabold">{product.title}</CardTitle>
                <CardDescription className="text-md font-bold">
                    {selectedVariant?.availableForSale ? (
                        "$" + parseFloat(selectedVariant.price.amount).toFixed(2)
                    ) : (
                        <p className="gap-2 text-red-500">
                            <span className="mr-2 line-through">$ {parseFloat(selectedVariant?.price.amount || "0.00").toFixed(2)}</span>{" "}
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
                        {product.colors && product.colors.length > 0 && (
                            <div className="flex w-full flex-col items-start gap-1">
                                <p className="text-sm font-medium text-foreground/80">Color</p>
                                <Select value={selectedColor} onValueChange={setSelectedColor} disabled={isLoading}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a color" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {product.colors.map((color) => (
                                            <SelectItem key={color} value={color}>
                                                {color}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {product.sizes && product.sizes.length > 0 && (
                            <div className="flex w-full flex-col items-start gap-1">
                                <p className="text-sm font-medium text-foreground/80">Size</p>
                                <Select value={selectedSize} onValueChange={setSelectedSize} disabled={isLoading}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select a size" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {product.sizes.map((size) => (
                                            <SelectItem key={size} value={size}>
                                                {size}
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
                                        const q = Math.min(100, Math.max(1, parseInt(e.target.value) || 1));
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
                    disabled={isLoading || !selectedVariant?.availableForSale || isAnimating}
                    onClick={handleAddToBasket}
                >
                    <span id="rewardId" />
                    {selectedVariant?.availableForSale ? (
                        <>
                            <ShoppingBasketIcon className="mr-2 inline-block size-5 disabled:cursor-not-allowed" />
                            <p>
                                Add {quantity} Item{quantity > 1 ? "s" : ""} to Basket
                            </p>
                        </>
                    ) : isProductAvailable ? (
                        "Selected variant out of stock"
                    ) : (
                        "Out of stock"
                    )}
                </Button>
            </CardFooter>
        </Card>
    );
}
