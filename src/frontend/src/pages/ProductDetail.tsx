import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";
import { useProduct } from "../hooks/useQueries";

function formatRs(cents: number) {
  return `Rs: ${(cents / 100).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function ProductDetail() {
  const { id } = useParams({ from: "/public-layout/product/$id" });
  const { data: product, isLoading, isError } = useProduct(id);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-12">
        <div
          data-ocid="product.loading_state"
          className="grid md:grid-cols-2 gap-12"
        >
          <Skeleton className="aspect-square w-full rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </main>
    );
  }

  if (isError || !product) {
    return (
      <main className="container mx-auto px-4 py-24 text-center">
        <div data-ocid="product.error_state">
          <h2 className="font-display text-2xl font-700 mb-2">
            Product Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            This product doesn't exist or has been removed.
          </p>
          <Button asChild variant="outline">
            <Link to="/shop">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to Shop
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const originalPrice = Number(product.priceInCents);
  const discountedPrice =
    product.discountedPriceInCents != null
      ? Number(product.discountedPriceInCents)
      : Math.round(originalPrice * 0.8);
  const effectivePrice = discountedPrice;
  const inStock = Number(product.stockQuantity) > 0;

  const handleAddToCart = () => {
    addItem({
      productId: product.id,
      productName: product.name,
      priceInCents: effectivePrice,
      imageUrl: product.imageUrl,
      category: product.category,
      quantity: qty,
    });
    toast.success(`${qty}x ${product.name} added to cart`);
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <Link
          to="/shop"
          data-ocid="product.back.link"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Shop
        </Link>

        <div className="grid md:grid-cols-2 gap-12">
          <div className="relative aspect-square bg-muted rounded-xl overflow-hidden">
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ShoppingCart className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
            {!inStock && (
              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                <Badge variant="secondary" className="text-base px-4 py-1">
                  Out of Stock
                </Badge>
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <Badge variant="outline" className="w-fit mb-3">
              {product.category}
            </Badge>
            <h1 className="font-display text-3xl md:text-4xl font-700 mb-3">
              {product.name}
            </h1>
            <p className="text-muted-foreground leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="flex items-baseline gap-3 mb-6 flex-wrap">
              <span className="font-display text-4xl font-800 text-foreground">
                {formatRs(effectivePrice)}
              </span>
              <span className="text-xl text-muted-foreground line-through">
                {formatRs(originalPrice)}
              </span>
              <Badge className="bg-destructive text-destructive-foreground text-xs">
                20% OFF
              </Badge>
              {inStock ? (
                <Badge
                  variant="outline"
                  className="text-green-600 border-green-200 bg-green-50"
                >
                  In Stock
                </Badge>
              ) : (
                <Badge variant="secondary">Out of Stock</Badge>
              )}
            </div>

            <div className="flex items-center gap-3 mb-6">
              <span className="text-sm font-medium text-muted-foreground">
                Quantity
              </span>
              <div className="flex items-center border border-border rounded-md">
                <button
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  data-ocid="product.qty.secondary_button"
                  className="px-3 py-2 hover:bg-muted transition-colors disabled:opacity-40"
                  disabled={qty <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  type="button"
                  onClick={() => setQty((q) => q + 1)}
                  data-ocid="product.qty.primary_button"
                  className="px-3 py-2 hover:bg-muted transition-colors"
                  disabled={!inStock}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={!inStock}
              data-ocid="product.cart.primary_button"
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Add to Cart — {formatRs(effectivePrice * qty)}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
