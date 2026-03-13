import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Navbar } from "./components/Navbar";
import { CartProvider } from "./context/CartContext";
import { Admin } from "./pages/Admin";
import { Cart } from "./pages/Cart";
import { Checkout } from "./pages/Checkout";
import { Home } from "./pages/Home";
import { OrderSuccess } from "./pages/OrderSuccess";
import { ProductDetail } from "./pages/ProductDetail";
import { Shop } from "./pages/Shop";

// Layout for public pages
function PublicLayout() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

// Routes
const rootRoute = createRootRoute();

const publicLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "public-layout",
  component: PublicLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/",
  component: Home,
});

const shopRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/shop",
  component: Shop,
});

const productRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/product/$id",
  component: ProductDetail,
});

const cartRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/cart",
  component: Cart,
});

const checkoutRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/checkout",
  component: Checkout,
});

const orderSuccessRoute = createRoute({
  getParentRoute: () => publicLayoutRoute,
  path: "/order-success",
  component: OrderSuccess,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: Admin,
});

const routeTree = rootRoute.addChildren([
  publicLayoutRoute.addChildren([
    homeRoute,
    shopRoute,
    productRoute,
    cartRoute,
    checkoutRoute,
    orderSuccessRoute,
  ]),
  adminRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <CartProvider>
      <RouterProvider router={router} />
      <Toaster position="bottom-right" richColors />
    </CartProvider>
  );
}
