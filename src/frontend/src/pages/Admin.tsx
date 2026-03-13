import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  LogIn,
  LogOut,
  Package,
  Pencil,
  Plus,
  Settings,
  ShoppingBag,
  Tag,
  Trash2,
  Upload,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Category, Product } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useAllProductsAdmin,
  useCategories,
  useCreateCategory,
  useCreateProduct,
  useDeleteProduct,
  useIsAdmin,
  useIsStripeConfigured,
  useOrders,
  useSetStripeConfiguration,
  useUpdateCategory,
  useUpdateOrderStatus,
  useUpdateProduct,
  useUploadProductImage,
} from "../hooks/useQueries";

const ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const EMPTY_PRODUCT: Omit<Product, "id"> = {
  name: "",
  description: "",
  priceInCents: BigInt(0),
  discountedPriceInCents: null,
  category: "",
  imageUrl: "",
  stockQuantity: BigInt(0),
  isActive: true,
};

const EMPTY_CATEGORY: Omit<Category, "id"> = {
  name: "",
  description: "",
  isActive: true,
};

function generateId() {
  return crypto.randomUUID();
}

export function Admin() {
  const { identity, login, clear, isLoggingIn, isInitializing } =
    useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsAdmin();

  const isLoggedIn = !!identity && !identity.getPrincipal().isAnonymous();

  if (isInitializing || adminLoading) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div data-ocid="admin.loading_state">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div
          className="text-center max-w-sm mx-auto px-4"
          data-ocid="admin.login.panel"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Settings className="w-7 h-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-2xl font-700 mb-2">Admin Login</h1>
          <p className="text-muted-foreground text-sm mb-6">
            Sign in to manage your store, products, orders, and settings.
          </p>
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
            data-ocid="admin.login.primary_button"
          >
            {isLoggingIn ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LogIn className="mr-2 h-4 w-4" />
            )}
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </Button>
        </div>
      </main>
    );
  }

  if (isAdmin === false) {
    return (
      <main className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center" data-ocid="admin.unauthorized.panel">
          <h2 className="font-display text-2xl font-700 mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
            You don't have admin privileges.
          </p>
          <Button
            variant="outline"
            onClick={clear}
            data-ocid="admin.logout.secondary_button"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </main>
    );
  }

  return <AdminDashboard onLogout={clear} />;
}

function AdminDashboard({ onLogout }: { onLogout: () => void }) {
  return (
    <main className="min-h-screen bg-muted/30">
      {/* Admin Header */}
      <header className="navbar-bg border-b border-white/10">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-primary" />
            <span className="font-display font-600 text-navbar-foreground">
              AS Store Admin
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="text-navbar-foreground/70 hover:text-navbar-foreground hover:bg-white/10"
            data-ocid="admin.logout.secondary_button"
          >
            <LogOut className="mr-2 h-3.5 w-3.5" /> Sign Out
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products">
          <TabsList
            data-ocid="admin.tabs.tab"
            className="mb-6 bg-background border border-border shadow-xs"
          >
            <TabsTrigger value="products" data-ocid="admin.products.tab">
              <Package className="w-4 h-4 mr-1.5" /> Products
            </TabsTrigger>
            <TabsTrigger value="orders" data-ocid="admin.orders.tab">
              <ShoppingBag className="w-4 h-4 mr-1.5" /> Orders
            </TabsTrigger>
            <TabsTrigger value="categories" data-ocid="admin.categories.tab">
              <Tag className="w-4 h-4 mr-1.5" /> Categories
            </TabsTrigger>
            <TabsTrigger value="settings" data-ocid="admin.settings.tab">
              <Settings className="w-4 h-4 mr-1.5" /> Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <ProductsTab />
          </TabsContent>
          <TabsContent value="orders">
            <OrdersTab />
          </TabsContent>
          <TabsContent value="categories">
            <CategoriesTab />
          </TabsContent>
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

function ProductsTab() {
  const { data: products, isLoading } = useAllProductsAdmin();
  const { data: categories } = useCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadImage = useUploadProductImage();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState<Omit<Product, "id"> & { id?: string }>(
    EMPTY_PRODUCT,
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [hasDiscount, setHasDiscount] = useState(false);

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_PRODUCT);
    setImageFile(null);
    setHasDiscount(false);
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm(p);
    setImageFile(null);
    setHasDiscount(p.discountedPriceInCents != null);
    setDialogOpen(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
  };

  const handleSave = async () => {
    try {
      let imageUrl = form.imageUrl;

      if (imageFile) {
        setUploading(true);
        const bytes = await imageFile.arrayBuffer();
        const blob = ExternalBlob.fromBytes(new Uint8Array(bytes));
        const uploaded = await uploadImage.mutateAsync(blob);
        imageUrl = uploaded.getDirectURL();
        setUploading(false);
      }

      const productData: Product = {
        id: editing?.id ?? generateId(),
        ...form,
        imageUrl,
        priceInCents: BigInt(form.priceInCents),
        discountedPriceInCents:
          hasDiscount && form.discountedPriceInCents != null
            ? BigInt(form.discountedPriceInCents)
            : null,
        stockQuantity: BigInt(form.stockQuantity),
      };

      if (editing) {
        await updateProduct.mutateAsync(productData);
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(productData);
        toast.success("Product created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save product");
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success("Product deleted");
    } catch {
      toast.error("Failed to delete product");
    }
  };

  return (
    <div
      className="bg-card rounded-lg border border-border p-6"
      data-ocid="admin.products.panel"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-700">Products</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.product.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg" data-ocid="admin.product.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editing ? "Edit Product" : "Add Product"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label className="mb-1.5 block text-sm">Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    placeholder="Product name"
                    data-ocid="admin.product.name.input"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">
                    Original Price (Rs paisa)
                  </Label>
                  <Input
                    type="number"
                    value={form.priceInCents.toString()}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        priceInCents: BigInt(e.target.value || 0),
                      }))
                    }
                    placeholder="350000"
                    data-ocid="admin.product.price.input"
                  />
                </div>
                <div>
                  <Label className="mb-1.5 block text-sm">Stock</Label>
                  <Input
                    type="number"
                    value={form.stockQuantity.toString()}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        stockQuantity: BigInt(e.target.value || 0),
                      }))
                    }
                    placeholder="10"
                    data-ocid="admin.product.stock.input"
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={hasDiscount}
                    onCheckedChange={(v) => {
                      setHasDiscount(v);
                      if (!v)
                        setForm((p) => ({
                          ...p,
                          discountedPriceInCents: null,
                        }));
                    }}
                    data-ocid="admin.product.discount.switch"
                  />
                  <Label className="text-sm">Has Discount Price</Label>
                </div>
                {hasDiscount && (
                  <div className="col-span-2">
                    <Label className="mb-1.5 block text-sm">
                      Discounted Price (Rs paisa)
                    </Label>
                    <Input
                      type="number"
                      value={form.discountedPriceInCents?.toString() ?? ""}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          discountedPriceInCents: BigInt(e.target.value || 0),
                        }))
                      }
                      placeholder="280000"
                      data-ocid="admin.product.discounted_price.input"
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label className="mb-1.5 block text-sm">Category</Label>
                  <Select
                    value={form.category}
                    onValueChange={(v) =>
                      setForm((p) => ({ ...p, category: v }))
                    }
                  >
                    <SelectTrigger data-ocid="admin.product.category.select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        ?.filter((c) => c.isActive)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.name}>
                            {c.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label className="mb-1.5 block text-sm">Description</Label>
                  <Textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, description: e.target.value }))
                    }
                    placeholder="Product description..."
                    rows={3}
                    data-ocid="admin.product.description.textarea"
                  />
                </div>
                <div className="col-span-2">
                  <Label className="mb-1.5 block text-sm">Product Image</Label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="product-image-upload"
                      className="flex items-center gap-2 px-3 py-2 border border-border rounded-md cursor-pointer hover:bg-muted transition-colors text-sm"
                      data-ocid="admin.product.upload_button"
                    >
                      <Upload className="w-4 h-4" />
                      {imageFile ? imageFile.name : "Choose Image"}
                      <input
                        id="product-image-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {form.imageUrl && !imageFile && (
                      <span className="text-xs text-muted-foreground truncate max-w-[140px]">
                        {form.imageUrl}
                      </span>
                    )}
                  </div>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={form.isActive}
                    onCheckedChange={(v) =>
                      setForm((p) => ({ ...p, isActive: v }))
                    }
                    data-ocid="admin.product.active.switch"
                  />
                  <Label className="text-sm">Active (visible in shop)</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="admin.product.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={
                  createProduct.isPending ||
                  updateProduct.isPending ||
                  uploading
                }
                className="bg-primary text-primary-foreground"
                data-ocid="admin.product.save_button"
              >
                {(createProduct.isPending ||
                  updateProduct.isPending ||
                  uploading) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {uploading ? "Uploading..." : editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div data-ocid="admin.products.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : products?.length === 0 ? (
        <div
          data-ocid="admin.products.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <Package className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No products yet. Add your first product.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.products.table">
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products?.map((p, idx) => (
                <TableRow
                  key={p.id}
                  data-ocid={`admin.products.row.${idx + 1}`}
                >
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {p.category}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>
                        Rs {(Number(p.priceInCents) / 100).toFixed(0)}
                      </span>
                      {p.discountedPriceInCents != null && (
                        <span className="text-xs text-primary">
                          Sale: Rs{" "}
                          {(Number(p.discountedPriceInCents) / 100).toFixed(0)}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{p.stockQuantity.toString()}</TableCell>
                  <TableCell>
                    <Badge variant={p.isActive ? "default" : "secondary"}>
                      {p.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEdit(p)}
                        data-ocid={`admin.product.edit_button.${idx + 1}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                            data-ocid={`admin.product.delete_button.${idx + 1}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent data-ocid="admin.product.delete.dialog">
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{p.name}". This
                              action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel data-ocid="admin.product.delete.cancel_button">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(p.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              data-ocid="admin.product.delete.confirm_button"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function OrdersTab() {
  const { data: orders, isLoading } = useOrders();
  const updateStatus = useUpdateOrderStatus();

  const handleStatusChange = async (orderId: string, status: string) => {
    try {
      await updateStatus.mutateAsync({ orderId, status });
      toast.success("Order status updated");
    } catch {
      toast.error("Failed to update order status");
    }
  };

  return (
    <div
      className="bg-card rounded-lg border border-border p-6"
      data-ocid="admin.orders.panel"
    >
      <h2 className="font-display text-xl font-700 mb-6">Orders</h2>

      {isLoading ? (
        <div data-ocid="admin.orders.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : orders?.length === 0 ? (
        <div
          data-ocid="admin.orders.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table data-ocid="admin.orders.table">
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.map((order, idx) => (
                <TableRow
                  key={order.id}
                  data-ocid={`admin.orders.row.${idx + 1}`}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {order.id.slice(0, 8)}...
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.customerName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {order.customerEmail}
                  </TableCell>
                  <TableCell>
                    ${(Number(order.totalInCents) / 100).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(
                      Number(order.createdAt) / 1_000_000,
                    ).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(v) => handleStatusChange(order.id, v)}
                    >
                      <SelectTrigger
                        className="w-32 h-7 text-xs"
                        data-ocid={`admin.order.status.select.${idx + 1}`}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ORDER_STATUSES.map((s) => (
                          <SelectItem
                            key={s}
                            value={s}
                            className="text-xs capitalize"
                          >
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function CategoriesTab() {
  const { data: categories, isLoading } = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState<Omit<Category, "id"> & { id?: string }>(
    EMPTY_CATEGORY,
  );

  const openAdd = () => {
    setEditing(null);
    setForm(EMPTY_CATEGORY);
    setDialogOpen(true);
  };

  const openEdit = (c: Category) => {
    setEditing(c);
    setForm(c);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      const categoryData: Category = {
        id: editing?.id ?? generateId(),
        ...form,
      };
      if (editing) {
        await updateCategory.mutateAsync(categoryData);
        toast.success("Category updated");
      } else {
        await createCategory.mutateAsync(categoryData);
        toast.success("Category created");
      }
      setDialogOpen(false);
    } catch {
      toast.error("Failed to save category");
    }
  };

  return (
    <div
      className="bg-card rounded-lg border border-border p-6"
      data-ocid="admin.categories.panel"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-xl font-700">Categories</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={openAdd}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-ocid="admin.category.open_modal_button"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Category
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="admin.category.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">
                {editing ? "Edit Category" : "Add Category"}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div>
                <Label className="mb-1.5 block text-sm">Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, name: e.target.value }))
                  }
                  placeholder="e.g. Pod Kits"
                  data-ocid="admin.category.name.input"
                />
              </div>
              <div>
                <Label className="mb-1.5 block text-sm">Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Category description..."
                  rows={2}
                  data-ocid="admin.category.description.textarea"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) =>
                    setForm((p) => ({ ...p, isActive: v }))
                  }
                  data-ocid="admin.category.active.switch"
                />
                <Label className="text-sm">Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDialogOpen(false)}
                data-ocid="admin.category.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={createCategory.isPending || updateCategory.isPending}
                className="bg-primary text-primary-foreground"
                data-ocid="admin.category.save_button"
              >
                {(createCategory.isPending || updateCategory.isPending) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {editing ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div data-ocid="admin.categories.loading_state" className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : categories?.length === 0 ? (
        <div
          data-ocid="admin.categories.empty_state"
          className="text-center py-12 text-muted-foreground"
        >
          <Tag className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p>No categories yet.</p>
        </div>
      ) : (
        <Table data-ocid="admin.categories.table">
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map((cat, idx) => (
              <TableRow
                key={cat.id}
                data-ocid={`admin.categories.row.${idx + 1}`}
              >
                <TableCell className="font-medium">{cat.name}</TableCell>
                <TableCell className="text-muted-foreground truncate max-w-xs">
                  {cat.description}
                </TableCell>
                <TableCell>
                  <Badge variant={cat.isActive ? "default" : "secondary"}>
                    {cat.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEdit(cat)}
                    data-ocid={`admin.category.edit_button.${idx + 1}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}

function SettingsTab() {
  const { data: isConfigured, isLoading } = useIsStripeConfigured();
  const setConfig = useSetStripeConfiguration();

  const [secretKey, setSecretKey] = useState("");
  const [countries, setCountries] = useState("US,GB,AE,AU,CA");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await setConfig.mutateAsync({
        secretKey,
        allowedCountries: countries
          .split(",")
          .map((c) => c.trim())
          .filter(Boolean),
      });
      toast.success("Stripe configuration saved");
      setSecretKey("");
    } catch {
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div
      className="bg-card rounded-lg border border-border p-6 max-w-xl"
      data-ocid="admin.settings.panel"
    >
      <h2 className="font-display text-xl font-700 mb-2">Payment Settings</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Configure Stripe to accept online payments in your store.
      </p>

      {isLoading ? (
        <Skeleton className="h-6 w-48 mb-6" />
      ) : (
        <div className="flex items-center gap-2 mb-6">
          <div
            className={`w-2 h-2 rounded-full ${isConfigured ? "bg-green-500" : "bg-amber-500"}`}
          />
          <span className="text-sm text-muted-foreground">
            Stripe is{" "}
            {isConfigured ? "configured and active" : "not configured yet"}
          </span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="space-y-4"
        data-ocid="admin.settings.form.panel"
      >
        <div>
          <Label className="mb-1.5 block text-sm font-medium">
            Stripe Secret Key
          </Label>
          <Input
            type="password"
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="sk_live_... or sk_test_..."
            required
            data-ocid="admin.settings.stripe_key.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Your Stripe secret key. Get it from the Stripe Dashboard.
          </p>
        </div>
        <div>
          <Label className="mb-1.5 block text-sm font-medium">
            Allowed Countries (comma-separated)
          </Label>
          <Input
            value={countries}
            onChange={(e) => setCountries(e.target.value)}
            placeholder="US,GB,AE,AU"
            data-ocid="admin.settings.countries.input"
          />
          <p className="text-xs text-muted-foreground mt-1">
            ISO 3166-1 alpha-2 country codes.
          </p>
        </div>
        <Button
          type="submit"
          disabled={setConfig.isPending}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
          data-ocid="admin.settings.save_button"
        >
          {setConfig.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Configuration
        </Button>
        {setConfig.isError && (
          <p
            data-ocid="admin.settings.error_state"
            className="text-sm text-destructive"
          >
            Failed to save. Please try again.
          </p>
        )}
        {setConfig.isSuccess && (
          <p
            data-ocid="admin.settings.success_state"
            className="text-sm text-green-600"
          >
            Configuration saved successfully!
          </p>
        )}
      </form>
    </div>
  );
}
