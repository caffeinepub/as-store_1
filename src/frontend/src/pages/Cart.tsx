import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCart } from "../context/CartContext";

const formatRs = (cents: number) =>
  `Rs: ${(cents / 100).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

export function Cart() {
  const { items, removeItem, updateQuantity, totalInCents } = useCart();

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div data-ocid="cart.empty_state" className="text-center py-24 px-4">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
          </div>
          <h2 className="font-display text-2xl font-700 mb-2">
            Your cart is empty
          </h2>
          <p className="text-muted-foreground mb-6">
            Add some products to get started.
          </p>
          <Button
            asChild
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/shop" data-ocid="cart.shop.link">
              Browse Shop <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="font-display text-3xl font-700 mb-8">Your Cart</h1>

        <div className="space-y-4 mb-8">
          <AnimatePresence initial={false}>
            {items.map((item, idx) => (
              <motion.div
                key={item.productId}
                layout
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 16 }}
                transition={{ duration: 0.2 }}
                data-ocid={`cart.item.${idx + 1}`}
                className="flex items-center gap-4 bg-card border border-border rounded-lg p-4"
              >
                <div className="w-16 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.productName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-6 h-6 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-display font-600 truncate">
                    {item.productName}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.category}
                  </p>
                  <p className="text-sm font-semibold mt-1">
                    {formatRs(item.priceInCents)} each
                  </p>
                </div>

                <div className="flex items-center border border-border rounded-md">
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity - 1)
                    }
                    data-ocid={`cart.qty.secondary_button.${idx + 1}`}
                    className="px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-3 text-sm font-medium">
                    {item.quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      updateQuantity(item.productId, item.quantity + 1)
                    }
                    data-ocid={`cart.qty.primary_button.${idx + 1}`}
                    className="px-2 py-1.5 hover:bg-muted transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="font-display font-700">
                    {formatRs(item.priceInCents * item.quantity)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeItem(item.productId)}
                    data-ocid={`cart.delete_button.${idx + 1}`}
                    className="text-destructive hover:text-destructive/80 transition-colors mt-1"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <Separator className="mb-6" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="text-muted-foreground text-sm">Total</span>
            <p className="font-display text-3xl font-800">
              {formatRs(totalInCents)}
            </p>
          </div>
          <Button
            asChild
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            data-ocid="cart.checkout.primary_button"
          >
            <Link to="/checkout">
              Proceed to Checkout <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
