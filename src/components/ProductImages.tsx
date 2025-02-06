import type { ProductResult } from "@/lib/schema";
import { cn } from "@/lib/utils";
import type { z } from "astro/zod";
import { useState } from "react";
import { Card, CardContent } from "./ui/card";

export default function ProductImages({ product }: { product: z.infer<typeof ProductResult> }) {
    const [selectedImage, setSelectedImage] = useState(product?.featuredImage);

    return (
        <div className="flex h-full w-full flex-col">
            <Card className="h-fit bg-card/60">
                <CardContent className="flex aspect-square items-center justify-center p-6">
                    <img
                        src={selectedImage?.url}
                        alt={selectedImage?.altText || ""}
                        className="rounded-md"
                    />
                </CardContent>
            </Card>

            <div className="mt-6 flex w-full flex-row flex-wrap items-center justify-center gap-4">
                {product?.images.nodes.map((image: any) => (
                    <div
                        key={image?.url}
                        className={cn(
                            "rounded-md ring-primary/80 ring-offset-4 ring-offset-background transition-all ease-in-out hover:cursor-pointer hover:ring-1",
                            selectedImage?.url === image?.url ? "ring-2" : ""
                        )}
                    >
                        <img
                            src={image?.url}
                            alt={image?.altText}
                            onClick={() => setSelectedImage(image)}
                            className="size-12 rounded-md md:size-16"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
