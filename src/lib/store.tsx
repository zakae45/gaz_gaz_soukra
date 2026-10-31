// Local, browser-only store. This is a FRONTEND PROTOTYPE layer:
// products, cart and orders live in localStorage until a real database is connected.
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { type Product } from "@/data/products";
import { supabase } from "@/lib/supabase";
export interface CartLine { productId: string; qty: number }
export type OrderStatus = "pending" | "confirmed" | "shipped" | "cancelled";
export interface Order {
  id: string;
  createdAt: string;
  customer: { name: string; phone: string; city: string; address: string; note?: string };
  lines: { productId: string; name: string; price: number; qty: number }[];
  total: number;
  status: OrderStatus;
}

interface StoreCtx {
  products: Product[];
  cart: CartLine[];
  orders: Order[];
  addToCart: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  placeOrder: (c: Order["customer"]) => Promise<Order>;
  upsertProduct: (p: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setOrderStatus: (id: string, s: OrderStatus) => Promise<void>;
  
}
  const Ctx = createContext<StoreCtx | null>(null);
  export function StoreProvider({ children }: { children: ReactNode }) {
  const KEY = "ggs-cart-v1";
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load products from Supabase
  useEffect(() => {
    let active = true;

    const loadProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (!active) return;

      if (error) {
        console.error("Error loading products:", error);
        return;
      }

      setProducts((data ?? []) as Product[]);
    };

    void loadProducts();

    return () => {
      active = false;
    };
  }, []);

 // Load cart from localStorage
useEffect(() => {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const d = JSON.parse(raw);
      if (Array.isArray(d.cart)) setCart(d.cart);
    }
  } catch {
    /* ignore corrupted storage */
  }
  setLoaded(true);
}, []);

// Load orders only for verified admins
useEffect(() => {
  let active = true;

  const loadOrdersIfAdmin = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    if (!active) return;

    if (!session) {
      setOrders([]);
      return;
    }

    const { data: isAdmin, error: adminError } =
      await supabase.rpc("is_admin");

    if (!active) return;

    if (adminError || !isAdmin) {
      setOrders([]);
      return;
    }

    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (!active) return;

    if (error) {
      console.error("Error loading orders:", error);
      return;
    }

    const loadedOrders: Order[] = (data ?? []).map((o) => ({
      id: o.id,
      createdAt: o.created_at,
      customer: {
        name: o.customer_name,
        phone: o.customer_phone,
        city: o.customer_city,
        address: o.customer_address,
        ...(o.customer_note ? { note: o.customer_note } : {}),
      },
      lines: (o.order_items ?? []).map((item: {
        product_id: string | null;
        product_name: string;
        price: number | string;
        qty: number;
      }) => ({
        productId: item.product_id ?? item.product_name,
        name: item.product_name,
        price: Number(item.price),
        qty: item.qty,
      })),
      total: Number(o.total),
      status: o.status as OrderStatus,
    }));

    setOrders(loadedOrders);
  };

  void loadOrdersIfAdmin();

  const { data: authListener } = supabase.auth.onAuthStateChange(() => {
    void loadOrdersIfAdmin();
  });

  return () => {
    active = false;
    authListener.subscription.unsubscribe();
  };
}, []);

  // Save cart locally
useEffect(() => {
  if (loaded) {
    localStorage.setItem(KEY, JSON.stringify({ cart }));
  }
}, [cart, loaded]);

  const value = useMemo<StoreCtx>(() => {
    const byId = (id: string) => products.find((p) => p.id === id);
    const cartTotal = cart.reduce((s, l) => s + (byId(l.productId)?.price ?? 0) * l.qty, 0);
    return {
      products, cart, orders, cartTotal,
      cartCount: cart.reduce((s, l) => s + l.qty, 0),
      addToCart: (id, qty = 1) => setCart((c) => {
        const stock = byId(id)?.stock ?? 0;
        const ex = c.find((l) => l.productId === id);
        if (ex) return c.map((l) => l.productId === id ? { ...l, qty: Math.min(stock, l.qty + qty) } : l);
        return [...c, { productId: id, qty: Math.min(stock, qty) }];
      }),
      setQty: (id, qty) => setCart((c) => c.map((l) => l.productId === id ? { ...l, qty: Math.max(1, Math.min(byId(id)?.stock ?? 1, qty)) } : l)),
      removeFromCart: (id) => setCart((c) => c.filter((l) => l.productId !== id)),
      clearCart: () => setCart([]),
     placeOrder: async (customer) => {
  if (cart.length === 0) {
    throw new Error("Cart is empty");
  }

  const items = cart.map((line) => ({
    product_id: line.productId,
    qty: line.qty,
  }));

  const { data, error } = await supabase.rpc("create_customer_order", {
    p_customer_name: customer.name,
    p_customer_phone: customer.phone,
    p_customer_city: customer.city,
    p_customer_address: customer.address,
    p_customer_note: customer.note ?? "",
    p_items: items,
  });

  if (error) {
    console.error("Error creating order:", error);
    throw error;
  }

  const result = data as {
    id: string;
    created_at: string;
    total: number;
    status: OrderStatus;
    customer_name: string;
    customer_phone: string;
    customer_city: string;
    customer_address: string;
    customer_note: string | null;
    items: {
      product_id: string;
      name: string;
      price: number;
      qty: number;
    }[];
  };

  const order: Order = {
    id: result.id,
    createdAt: result.created_at,
    customer: {
      name: result.customer_name,
      phone: result.customer_phone,
      city: result.customer_city,
      address: result.customer_address,
      ...(result.customer_note ? { note: result.customer_note } : {}),
    },
    lines: result.items.map((item) => ({
      productId: item.product_id,
      name: item.name,
      price: Number(item.price),
      qty: item.qty,
    })),
    total: Number(result.total),
    status: result.status,
  };

  setOrders((current) => [order, ...current]);
  setCart([]);

  // Refresh product stock from Supabase
  const { data: updatedProducts, error: refreshError } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (refreshError) {
    console.error("Error refreshing products:", refreshError);
  } else {
    setProducts((updatedProducts ?? []) as Product[]);
  }

  return order;
},
      upsertProduct: async (p) => {
  const { error } = await supabase
    .from("products")
    .upsert({
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      compatibility: p.compatibility,
      price: p.price,
      stock: p.stock,
      image: p.image,
      description: p.description,
      featured: p.featured ?? false,
    });

  if (error) {
    console.error("Error saving product:", error);
    throw error;
  }

  setProducts((ps) =>
    ps.some((x) => x.id === p.id)
      ? ps.map((x) => (x.id === p.id ? p : x))
      : [p, ...ps]
  );
},
      deleteProduct: async (id) => {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error deleting product:", error);
    throw error;
  }

  setProducts((ps) => ps.filter((p) => p.id !== id));
  setCart((c) => c.filter((l) => l.productId !== id));
},
      setOrderStatus: async (id, status) => {
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id);

  if (error) {
    console.error("Error updating order status:", error);
    throw error;
  }

  setOrders((os) =>
    os.map((o) => (o.id === id ? { ...o, status } : o))
  );
},

    };
  }, [products, cart, orders]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
} 