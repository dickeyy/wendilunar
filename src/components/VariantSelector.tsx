import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

export default function VariantSelector({
    disabled,
    selectedVariant,
    product,
    setSelectedVariant
}: {
    disabled: boolean;
    selectedVariant: any;
    product: any;
    setSelectedVariant: (variant: any) => void;
}) {
    return (
        <Select
            disabled={disabled}
            aria-label="Select a variant"
            onValueChange={(variant: any) => setSelectedVariant(variant)}
        >
            <SelectTrigger className="h-fit max-h-fit w-full border border-border bg-neutral-400/20 py-2">
                <SelectValue placeholder={selectedVariant?.title} />
            </SelectTrigger>
            <SelectContent>
                {product.variants.nodes.map((variant: any) => (
                    <SelectItem
                        key={variant.id}
                        value={variant}
                        aria-label={variant.title}
                        disabled={variant.availableForSale === false}
                        className={
                            variant.availableForSale === false
                                ? "cursor-not-allowed text-red-500 text-opacity-50 line-through"
                                : ""
                        }
                    >
                        {variant.title} -{" "}
                        {"$" + parseFloat(variant?.price?.amount ?? "0.00").toFixed(2)}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
