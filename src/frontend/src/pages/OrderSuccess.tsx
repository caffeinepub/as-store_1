import { Button } from "@/components/ui/button";
import { Link, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { useStripeSessionStatus } from "../hooks/useQueries";

export function OrderSuccess() {
  const search = useSearch({ from: "/public-layout/order-success" }) as {
    session_id?: string;
  };
  const sessionId = search.session_id ?? null;

  const { data: status, isLoading } = useStripeSessionStatus(sessionId);

  useEffect(() => {
    document.title = "Order Confirmation — AS Store";
  }, []);

  if (isLoading && sessionId) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div data-ocid="order.loading_state" className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Confirming your order...</p>
        </div>
      </main>
    );
  }

  const isFailed = status?.__kind__ === "failed";

  return (
    <main className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center max-w-md mx-auto px-4"
        data-ocid="order.success.panel"
      >
        {isFailed ? (
          <div data-ocid="order.error_state">
            <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
            <h1 className="font-display text-3xl font-700 mb-2">
              Payment Failed
            </h1>
            <p className="text-muted-foreground mb-6">
              {(status as any)?.failed?.error ??
                "Something went wrong with your payment."}
            </p>
            <div className="flex gap-3 justify-center">
              <Button
                asChild
                variant="outline"
                data-ocid="order.back.secondary_button"
              >
                <Link to="/cart">Return to Cart</Link>
              </Button>
              <Button
                asChild
                className="bg-primary text-primary-foreground"
                data-ocid="order.shop.primary_button"
              >
                <Link to="/shop">Continue Shopping</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div data-ocid="order.success_state">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-display text-3xl font-700 mb-2">
              Order Confirmed!
            </h1>
            <p className="text-muted-foreground mb-2">
              Your order has been placed successfully.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              We'll send you a confirmation email shortly. Your items will be
              shipped soon.
            </p>
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="order.shop.primary_button"
            >
              <Link to="/shop">Continue Shopping</Link>
            </Button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
