import Map "mo:core/Map";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Time "mo:core/Time";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Storage "blob-storage/Storage";
import Stripe "stripe/stripe";
import OutCall "http-outcalls/outcall";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";

actor {
  // Internal storage type (no discountedPriceInCents — keeps stable compatibility)
  type StoredProduct = {
    id : Text;
    name : Text;
    description : Text;
    priceInCents : Nat;
    category : Text;
    imageUrl : Text;
    stockQuantity : Nat;
    isActive : Bool;
  };

  // Public API type (includes optional discount)
  public type Product = {
    id : Text;
    name : Text;
    description : Text;
    priceInCents : Nat;
    discountedPriceInCents : ?Nat;
    category : Text;
    imageUrl : Text;
    stockQuantity : Nat;
    isActive : Bool;
  };

  public type Category = {
    id : Text;
    name : Text;
    description : Text;
    isActive : Bool;
  };

  public type OrderItem = {
    productId : Text;
    productName : Text;
    quantity : Nat;
    priceInCents : Nat;
  };

  public type Order = {
    id : Text;
    customerName : Text;
    customerEmail : Text;
    customerAddress : Text;
    items : [OrderItem];
    totalInCents : Nat;
    status : Text;
    stripePaymentIntentId : Text;
    createdAt : Int;
  };

  public type UserProfile = {
    name : Text;
  };

  // Stable maps — StoredProduct keeps the original schema
  let products = Map.empty<Text, StoredProduct>();
  // Separate stable map for discounts (productId -> discountedPriceInCents)
  let productDiscounts = Map.empty<Text, Nat>();
  let categories = Map.empty<Text, Category>();
  let orders = Map.empty<Text, Order>();
  let userProfiles = Map.empty<Principal, UserProfile>();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  var stripeConfig : ?Stripe.StripeConfiguration = null;

  // Helper: merge stored product with discount info
  func toProduct(p : StoredProduct) : Product {
    {
      id = p.id;
      name = p.name;
      description = p.description;
      priceInCents = p.priceInCents;
      discountedPriceInCents = productDiscounts.get(p.id);
      category = p.category;
      imageUrl = p.imageUrl;
      stockQuantity = p.stockQuantity;
      isActive = p.isActive;
    };
  };

  // Helper: split Product into StoredProduct + optional discount
  func fromProduct(p : Product) : (StoredProduct, ?Nat) {
    let stored : StoredProduct = {
      id = p.id;
      name = p.name;
      description = p.description;
      priceInCents = p.priceInCents;
      category = p.category;
      imageUrl = p.imageUrl;
      stockQuantity = p.stockQuantity;
      isActive = p.isActive;
    };
    (stored, p.discountedPriceInCents);
  };

  public query func isStripeConfigured() : async Bool {
    stripeConfig != null;
  };

  public shared ({ caller }) func setStripeConfiguration(config : Stripe.StripeConfiguration) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can perform this action");
    };
    stripeConfig := ?config;
  };

  func getStripeConfig() : Stripe.StripeConfiguration {
    switch (stripeConfig) {
      case (null) { Runtime.trap("Stripe is not configured") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Products
  public shared ({ caller }) func createProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create products");
    };
    let (stored, discount) = fromProduct(product);
    products.add(stored.id, stored);
    switch (discount) {
      case (null) { productDiscounts.remove(stored.id) };
      case (?d) { productDiscounts.add(stored.id, d) };
    };
  };

  public shared ({ caller }) func updateProduct(product : Product) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update products");
    };
    let (stored, discount) = fromProduct(product);
    products.add(stored.id, stored);
    switch (discount) {
      case (null) { productDiscounts.remove(stored.id) };
      case (?d) { productDiscounts.add(stored.id, d) };
    };
  };

  public shared ({ caller }) func deleteProduct(productId : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete products");
    };
    products.remove(productId);
    productDiscounts.remove(productId);
  };

  public query ({ caller }) func getProducts() : async [Product] {
    products.values().toArray().filter(func(p) { p.isActive }).map(toProduct);
  };

  public query ({ caller }) func getProductById(id : Text) : async Product {
    switch (products.get(id)) {
      case (null) { Runtime.trap("Product not found") };
      case (?product) { toProduct(product) };
    };
  };

  public query ({ caller }) func getAllProductsAdmin() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all products");
    };
    products.values().toArray().map(toProduct);
  };

  // Categories
  public shared ({ caller }) func createCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can create categories");
    };
    categories.add(category.id, category);
  };

  public shared ({ caller }) func updateCategory(category : Category) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update categories");
    };
    categories.add(category.id, category);
  };

  public query ({ caller }) func getCategories() : async [Category] {
    categories.values().toArray().filter(func(c) { c.isActive });
  };

  // Orders
  public shared ({ caller }) func createOrder(order : Order) : async Text {
    orders.add(order.id, order);
    order.id;
  };

  public query ({ caller }) func getOrderById(id : Text) : async Order {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access order details");
    };
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public query ({ caller }) func getOrders() : async [Order] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access all orders");
    };
    orders.values().toArray();
  };

  public shared ({ caller }) func updateOrderStatus(orderId : Text, status : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can update order status");
    };
    let order = switch (orders.get(orderId)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
    let updatedOrder = {
      order with
      status
    };
    orders.add(orderId, updatedOrder);
  };

  // Image Upload
  public shared ({ caller }) func uploadProductImage(file : Storage.ExternalBlob) : async Storage.ExternalBlob {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can upload product images");
    };
    file;
  };

  public query func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public func getStripeSessionStatus(sessionId : Text) : async Stripe.StripeSessionStatus {
    await Stripe.getSessionStatus(getStripeConfig(), sessionId, transform);
  };

  public shared ({ caller }) func createCheckoutSession(items : [Stripe.ShoppingItem], successUrl : Text, cancelUrl : Text) : async Text {
    await Stripe.createCheckoutSession(getStripeConfig(), caller, items, successUrl, cancelUrl, transform);
  };

  system func preupgrade() {};

  system func postupgrade() {
    categories.add(
      "pod_kits",
      {
        id = "pod_kits";
        name = "Pod Kits";
        description = "Starter pod kits";
        isActive = true;
      },
    );
    categories.add(
      "devices",
      {
        id = "devices";
        name = "Devices";
        description = "Vape devices";
        isActive = true;
      },
    );
    // Seed: Caliburn G3 Lite
    if (products.get("caliburn-g3-lite") == null) {
      products.add(
        "caliburn-g3-lite",
        {
          id = "caliburn-g3-lite";
          name = "Caliburn G3 Lite";
          description = "The Caliburn G3 Lite is a compact and stylish pod kit delivering a smooth, satisfying vape experience. Lightweight design with impressive performance.";
          priceInCents = 350000;
          category = "Devices";
          imageUrl = "/assets/uploads/G3-Lite-1.jpg";
          stockQuantity = 50;
          isActive = true;
        },
      );
      productDiscounts.add("caliburn-g3-lite", 280000);
    };
  };
};
