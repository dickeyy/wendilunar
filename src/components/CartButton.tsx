import { ShoppingBasketIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useStore } from "@nanostores/react";
import { cart, initCart, isCartSheetOpen } from "@/stores/cart-store";
import { useEffect } from "react";

export default function CartButton() {
    const isOpen = useStore(isCartSheetOpen);
    const c = useStore(cart);
    const size = c?.totalQuantity || 0;

    // on mount, init cart
    useEffect(() => {
        initCart();
    }, []);

    return (
        <Button
            variant="default"
            className="flex h-fit items-center gap-2 rounded-[0.55rem] px-2 py-[0.4rem]"
            onClick={() => isCartSheetOpen.set(!isOpen)}
        >
            {size > 0 && <p className="text-xs font-bold">{size}</p>}
            <ShoppingBasketIcon className="size-4" />
        </Button>
    );
}
