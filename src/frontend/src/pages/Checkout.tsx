import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "../context/CartContext";

const formatRs = (cents: number) =>
  `Rs: ${(cents / 100).toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;

export function Checkout() {
  const { items, totalInCents, clearCart } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "",
    address: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    clearCart();
    toast.success("Order placed! We'll contact you to confirm.");
    navigate({ to: "/order-success" });
  };

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-display text-2xl font-700 mb-2">Cart is empty</h2>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/shop">Return to Shop</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Link
          to="/cart"
          data-ocid="checkout.back.link"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Cart
        </Link>

        <h1 className="font-display text-3xl font-700 mb-8">Checkout</h1>

        <div className="grid md:grid-cols-5 gap-10">
          <form
            onSubmit={handleSubmit}
            className="md:col-span-3 space-y-5"
            data-ocid="checkout.form.panel"
          >
            <div>
              <Label
                htmlFor="name"
                className="mb-1.5 block text-sm font-medium"
              >
                Full Name
              </Label>
              <Input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Ali Ahmed"
                data-ocid="checkout.name.input"
              />
            </div>
            <div>
              <Label
                htmlFor="phone"
                className="mb-1.5 block text-sm font-medium"
              >
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                placeholder="03XX-XXXXXXX"
                data-ocid="checkout.phone.input"
              />
            </div>
            <div>
              <Label
                htmlFor="city"
                className="mb-1.5 block text-sm font-medium"
              >
                City
              </Label>
              <Input
                id="city"
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="Karachi"
                data-ocid="checkout.city.input"
              />
            </div>
            <div>
              <Label
                htmlFor="address"
                className="mb-1.5 block text-sm font-medium"
              >
                Full Address
              </Label>
              <Input
                id="address"
                name="address"
                value={form.address}
                onChange={handleChange}
                required
                placeholder="House #, Street, Area"
                data-ocid="checkout.address.input"
              />
            </div>

            <Button
              type="submit"
              size="lg"
              data-ocid="checkout.pay.submit_button"
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Place Order — Cash on Delivery
            </Button>
          </form>

          <div className="md:col-span-2">
            <div
              className="bg-card border border-border rounded-lg p-5 sticky top-20"
              data-ocid="checkout.summary.panel"
            >
              <h3 className="font-display font-600 mb-4">Order Summary</h3>
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm"
                  >
                    <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium flex-shrink-0">
                      {formatRs(item.priceInCents * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between font-display font-700">
                <span>Total</span>
                <span>{formatRs(totalInCents)}</span>
              </div>
              <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-3">
                <PackageCheck className="w-3.5 h-3.5" />
                Pay when your order arrives
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
