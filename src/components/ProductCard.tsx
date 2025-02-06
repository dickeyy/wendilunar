import type { z } from "astro/zod";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import type { ProductResult } from "@/lib/schema";

export default function ProductCard({ product }: { product: z.infer<typeof ProductResult> }) {
    return (
        <a href={`/product/${product?.handle}`} className="group h-full">
            <Card className="flex h-full flex-col justify-between bg-card/60 hover:bg-card">
                <CardHeader>
                    <CardTitle className="text-xl font-bold">{product?.title}</CardTitle>
                    <CardDescription className="text-md font-medium">
                        $
                        {parseFloat(product?.variants?.nodes[0]?.price?.amount ?? "0.00").toFixed(
                            2
                        )}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <img
                        src={product?.images?.nodes[0]?.url}
                        alt={product?.title}
                        className="w-full rounded-sm"
                    />
                </CardContent>
            </Card>
        </a>
    );
}
