import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShoppingBag } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";
import { ProductCard } from "../components/ProductCard";
import { useCategories, useProducts } from "../hooks/useQueries";

export function Shop() {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: categories } = useCategories();

  const filtered = useMemo(() => {
    if (!products) return [];
    if (activeCategory === "all") return products.filter((p) => p.isActive);
    return products.filter((p) => p.isActive && p.category === activeCategory);
  }, [products, activeCategory]);

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8"
        >
          <h1 className="font-display text-3xl md:text-4xl font-700 mb-2">
            Shop
          </h1>
          <p className="text-muted-foreground">
            Browse our full range of premium pod kits and devices.
          </p>
        </motion.div>

        <div className="mb-8">
          <Tabs value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList
              data-ocid="shop.filter.tab"
              className="bg-muted/60 h-auto p-1 flex-wrap"
            >
              <TabsTrigger value="all" data-ocid="shop.all.tab">
                All Products
              </TabsTrigger>
              {categories
                ?.filter((c) => c.isActive)
                .map((cat) => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.name}
                    data-ocid="shop.category.tab"
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
            </TabsList>
          </Tabs>
        </div>

        {productsLoading ? (
          <div
            data-ocid="shop.loading_state"
            className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: skeleton placeholders
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div
            data-ocid="shop.empty_state"
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <ShoppingBag className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <h3 className="font-display text-xl font-600 mb-2">
              {activeCategory === "all"
                ? "No products yet"
                : `No ${activeCategory} products`}
            </h3>
            <p className="text-muted-foreground text-sm max-w-xs">
              {activeCategory === "all"
                ? "New products are being added soon. Check back shortly!"
                : "Try a different category or check back soon."}
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
              >
                <ProductCard product={product} index={idx + 1} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
