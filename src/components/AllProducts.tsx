import type { ProductResult } from "@/lib/schema";
import ProductCard from "./ProductCard";
import type { z } from "astro/zod";
import { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";

export default function AllProducts({
    products,
    collections
}: {
    products: z.infer<typeof ProductResult>[];
    collections: any[];
}) {
    const [activeCollection, setActiveCollection] = useState("all");

    const filteredProducts = useMemo(() => {
        if (activeCollection === "all") {
            return products;
        }
        return products.filter((product) =>
            product.collections?.nodes?.some((collection) => collection.title === activeCollection)
        );
    }, [products, activeCollection]);

    return (
        <div className="flex flex-col gap-4 px-2 pb-8 md:px-16" id="shop">
            <h2 className="text-3xl font-extrabold">My Merch!</h2>
            <CollectionTabs
                collections={collections}
                activeCollection={activeCollection}
                setActiveCollection={setActiveCollection}
            />
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    );
}

function CollectionTabs({
    collections,
    activeCollection,
    setActiveCollection
}: {
    collections: any[];
    activeCollection: string;
    setActiveCollection: (collection: string) => void;
}) {
    return (
        <div className="flex w-full flex-row justify-between">
            <div className="flex flex-row flex-wrap gap-2">
                {collections.map((collection: any) => (
                    <Button
                        key={collection.id}
                        variant="ghost"
                        onClick={() => {
                            if (activeCollection == collection.title) {
                                setActiveCollection("all");
                            } else {
                                setActiveCollection(collection.title);
                            }
                        }}
                        className={
                            "border hover:bg-primary" +
                            (activeCollection == collection.title
                                ? " border-primary bg-primary"
                                : " bg-card/60 hover:bg-card")
                        }
                    >
                        {collection.title}
                    </Button>
                ))}
            </div>
        </div>
    );
}
