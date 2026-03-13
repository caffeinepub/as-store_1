import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "@tanstack/react-router";
import { Menu, ShoppingCart, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useCart } from "../context/CartContext";

export function Navbar() {
  const { totalItems } = useCart();
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const links = [
    { to: "/", label: "Home" },
    { to: "/shop", label: "Shop" },
  ];

  return (
    <header className="navbar-bg sticky top-0 z-50 shadow-[0_1px_0_0_oklch(1_0_0/0.08)]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link
          to="/"
          data-ocid="nav.link"
          className="flex items-center gap-2 group"
        >
          <img
            src="/assets/uploads/Store-Logo-1-2.jpeg"
            alt="AS Store Logo"
            className="h-10 w-auto object-contain rounded-sm"
          />
          <span className="font-display text-xl font-700 text-navbar-foreground tracking-tight">
            AS Store
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              data-ocid={`nav.${link.label.toLowerCase()}.link`}
              className={`text-sm font-medium transition-colors ${
                location.pathname === link.to
                  ? "text-primary"
                  : "text-navbar-foreground/70 hover:text-navbar-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/cart" data-ocid="nav.cart.link" className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="text-navbar-foreground hover:bg-white/10 hover:text-navbar-foreground"
            >
              <ShoppingCart className="w-5 h-5" />
              {totalItems > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {totalItems}
                </Badge>
              )}
            </Button>
          </Link>

          <button
            type="button"
            className="md:hidden text-navbar-foreground p-1"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden navbar-bg border-t border-white/10"
          >
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-ocid={`nav.mobile.${link.label.toLowerCase()}.link`}
                  onClick={() => setMobileOpen(false)}
                  className="py-2 text-sm text-navbar-foreground/80 hover:text-navbar-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
