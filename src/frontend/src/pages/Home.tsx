import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Package, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

const CATEGORIES = [
  {
    name: "Pod Kits",
    description:
      "Compact, portable pod systems for the modern vaper. Simple, sleek, satisfying.",
    image: "/assets/generated/category-pod-kits.dim_600x400.jpg",
    tag: "Best Sellers",
  },
  {
    name: "Devices",
    description:
      "Advanced vaping devices with precision control and premium build quality.",
    image: "/assets/generated/category-devices.dim_600x400.jpg",
    tag: "New Arrivals",
  },
];

const FEATURES = [
  {
    icon: Zap,
    title: "Fast Delivery",
    desc: "Express shipping on all orders across the region.",
  },
  {
    icon: Shield,
    title: "Authentic Products",
    desc: "100% genuine products direct from manufacturers.",
  },
  {
    icon: Package,
    title: "Easy Returns",
    desc: "Hassle-free 30-day return policy on all items.",
  },
];

export function Home() {
  return (
    <main>
      {/* Hero — above-the-fold, ultra fast */}
      <section
        className="relative min-h-[92vh] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "url('/assets/generated/hero-as-store.dim_1600x900.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        data-ocid="home.section"
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-[oklch(0.12_0.015_265/0.72)]" />

        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-block text-xs font-medium tracking-widest uppercase text-primary mb-4 px-3 py-1 border border-primary/40 rounded-full">
              Premium Vaping Store
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-800 text-white leading-[1.1] tracking-tight mb-6"
          >
            AS Store
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-white/70 mb-8 max-w-xl mx-auto leading-relaxed"
          >
            Premium pod kits &amp; devices. Curated for quality, built for your
            lifestyle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 justify-center"
          >
            <Button
              asChild
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
              data-ocid="home.shop.primary_button"
            >
              <Link to="/shop">
                Shop Now
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 text-white bg-white/10 hover:bg-white/20 hover:text-white backdrop-blur-sm"
              data-ocid="home.explore.secondary_button"
            >
              <Link to="/shop">Explore Categories</Link>
            </Button>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/40">
          <div className="w-px h-12 bg-gradient-to-b from-white/0 to-white/30" />
          <span className="text-xs tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-700 mb-3">
              Shop by Category
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Whether you're new to vaping or a seasoned enthusiast, we have the
              right device for you.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {CATEGORIES.map((cat, i) => (
              <motion.div
                key={cat.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
              >
                <Link
                  to="/shop"
                  data-ocid={`home.category.item.${i + 1}`}
                  className="group relative block rounded-xl overflow-hidden aspect-[4/3] cursor-pointer"
                >
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[oklch(0.12_0.015_265/0.8)] via-[oklch(0.12_0.015_265/0.3)] to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end">
                    <span className="inline-block text-xs text-primary font-semibold uppercase tracking-widest mb-1">
                      {cat.tag}
                    </span>
                    <h3 className="font-display text-2xl font-700 text-white mb-1">
                      {cat.name}
                    </h3>
                    <p className="text-white/70 text-sm line-clamp-2">
                      {cat.description}
                    </p>
                    <span className="mt-3 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      Browse <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-muted/40 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex flex-col items-center text-center gap-3"
              >
                <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h4 className="font-display font-600 mb-1">{f.title}</h4>
                  <p className="text-sm text-muted-foreground">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
