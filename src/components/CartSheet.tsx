import { Button } from "./ui/button";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle
} from "./ui/sheet";
import { useStore } from "@nanostores/react";
import { cart, isCartSheetOpen, removeCartItems } from "@/stores/cart-store";
import { ScrollArea } from "./ui/scroll-area";
import type { z } from "astro/zod";
import type { CartItemResult, CartResult } from "@/lib/schema";
import { FrownIcon, StarIcon, TrashIcon } from "lucide-react";

export default function CartSheet() {
    const isOpen = useStore(isCartSheetOpen);
    const c = useStore(cart);

    return (
        <Sheet open={isOpen} onOpenChange={(open) => isCartSheetOpen.set(open)}>
            <SheetContent side="right" className="w-full">
                <SheetHeader>
                    <SheetTitle className="text-3xl font-extrabold">Basket</SheetTitle>
                    <SheetDescription className="font-medium">
                        To remove an item, click on the trash can.
                    </SheetDescription>
                </SheetHeader>

                <CartItems c={c} />

                <SheetFooter className="w-full">
                    <div className="absolute bottom-8 left-6 flex w-[90%] flex-col items-center justify-center gap-4">
                        <div className="flex w-full flex-col items-start">
                            <p className="text-sm font-normal text-foreground/80">Subtotal</p>
                            <p className="text-2xl font-bold text-foreground">
                                $
                                {parseFloat(
                                    c?.cost?.subtotalAmount?.amount ?? "0.00"
                                ).toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                })}
                                <span className="ml-2 text-xs font-normal text-foreground/80">
                                    USD + shipping
                                </span>
                            </p>
                        </div>
                        <Button className="w-full font-bold" asChild size="lg">
                            <a
                                href={c?.lines.nodes.length > 0 ? c?.checkoutUrl : "#"}
                                rel="noreferrer"
                            >
                                <StarIcon className="mr-2 size-5 fill-primary-foreground disabled:cursor-not-allowed" />
                                Checkout
                            </a>
                        </Button>
                    </div>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}

function CartItems({ c }: { c: z.infer<typeof CartResult> }) {
    return (
        <ScrollArea className="mt-8 h-[73%] w-full">
            {c?.lines.nodes.length === 0 && <EmptyCart />}
            {c?.lines.nodes.map((line: z.infer<typeof CartItemResult>) => <CartItem line={line} />)}
        </ScrollArea>
    );
}

function EmptyCart() {
    return (
        <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md border bg-neutral-400/20 p-4">
            <FrownIcon className="size-8 text-foreground/80" />
            <p className="text-sm font-medium text-foreground/80">Your basket is empty</p>
        </div>
    );
}

function CartItem({ line }: { line: z.infer<typeof CartItemResult> }) {
    return (
        <div className="mt-2 flex w-full flex-row items-center justify-between gap-4 rounded-md border bg-neutral-400/20 p-4">
            <div className="flex w-full flex-row items-center gap-4">
                <img
                    src={line?.merchandise?.image?.url}
                    alt={line?.merchandise?.image?.altText || ""}
                    className="size-20 rounded-md"
                />
                <div className="flex w-full flex-col items-start gap-1">
                    <p className="text-sm font-medium text-foreground/80">
                        {line?.merchandise?.product?.title}{" "}
                        {line?.merchandise?.title === "Default Title"
                            ? ""
                            : "- " + line?.merchandise?.title}
                    </p>
                    <p className="text-sm font-normal text-foreground/80">
                        {line?.quantity} x ${line?.cost?.totalAmount?.amount}
                    </p>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    removeCartItems([line?.id]);
                }}
            >
                <TrashIcon className="size-4 disabled:cursor-not-allowed" />
            </Button>
        </div>
    );
}
