import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "../backend.d";
import { useCart } from "../context/CartContext";

interface ProductCardProps {
  product: Product;
  index: number;
}

function formatRs(cents: number) {
  return `Rs: ${(cents / 100).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
}

export function ProductCard({ product, index }: ProductCardProps) {
  const { addItem } = useCart();
  const originalPrice = Number(product.priceInCents);
  const discountedPrice =
    product.discountedPriceInCents != null
      ? Number(product.discountedPriceInCents)
      : Math.round(originalPrice * 0.8);
  const effectivePrice = discountedPrice;
  const inStock = Number(product.stockQuantity) > 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!inStock) return;
    addItem({
      productId: product.id,
      productName: product.name,
      priceInCents: effectivePrice,
      imageUrl: product.imageUrl,
      category: product.category,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <Link
      to="/product/$id"
      params={{ id: product.id }}
      data-ocid={`shop.product.item.${index}`}
      className="block"
    >
      <article className="group bg-card rounded-lg overflow-hidden border border-border card-hover cursor-pointer">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-muted-foreground/30" />
            </div>
          )}
          <Badge className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs">
            20% OFF
          </Badge>
          <Badge
            variant="outline"
            className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm text-xs"
          >
            {product.category}
          </Badge>
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-display font-600 text-card-foreground truncate mb-1">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-display font-700 text-lg text-foreground">
                {formatRs(effectivePrice)}
              </span>
              <span className="text-xs text-muted-foreground line-through">
                {formatRs(originalPrice)}
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleAddToCart}
              disabled={!inStock}
              data-ocid={`shop.product.button.${index}`}
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
            >
              <ShoppingCart className="w-3.5 h-3.5 mr-1" />
              Add
            </Button>
          </div>
        </div>
      </article>
    </Link>
  );
}
