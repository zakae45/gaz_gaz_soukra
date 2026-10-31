
import { AlertTriangle, Boxes, ClipboardList, Package, Pencil, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { categories, formatPrice, type CategoryId, type Product } from "@/data/products";
import { useStore, type OrderStatus } from "@/lib/store";
import engine from "@/assets/cat-engine.jpg";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { supabase } from "@/lib/supabase";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Gaz Gaz Soukra" },
      { name: "description", content: "Manage products, prices, stock and orders." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Admin — Gaz Gaz Soukra" },
      { property: "og:description", content: "Shop management dashboard." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const statusStyle: Record<OrderStatus, string> = {
  pending: "bg-accent text-foreground",
  confirmed: "bg-primary/20 text-primary",
  shipped: "bg-success/20 text-success",
  cancelled: "bg-muted text-muted-foreground",
};
const input = "h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary";

function Admin() {
    const navigate = useNavigate();
  const [authChecking, setAuthChecking] = useState(true);
  const [authError, setAuthError] = useState("");
    useEffect(() => {
    let active = true;

    const verifyAdmin = async () => {
      const { data: { session }, error: sessionError } =
        await supabase.auth.getSession();

      if (!active) return;

      if (sessionError || !session) {
        await navigate({ to: "/login", replace: true });
        return;
      }

      const { data: isAdmin, error: adminError } =
        await supabase.rpc("is_admin");

      if (!active) return;

      if (adminError) {
        setAuthError("Could not verify admin access. Please try again.");
        setAuthChecking(false);
        return;
      }

      if (!isAdmin) {
        await supabase.auth.signOut();
        await navigate({ to: "/login", replace: true });
        return;
      }

      setAuthChecking(false);
    };

    verifyAdmin();

    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (!session) {
          void navigate({ to: "/login", replace: true });
        }
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [navigate]);
  const { products, orders, upsertProduct, deleteProduct, setOrderStatus,  } = useStore();
  const [tab, setTab] = useState<"products" | "orders">("products");
  const [editing, setEditing] = useState<Product | null>(null);

  const low = products.filter((p) => p.stock <= 3).length;
  const revenue = orders.filter((o) => o.status !== "cancelled").reduce((s, o) => s + o.total, 0);

  const save = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editing) return;
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name")).trim();
    const price = Number(f.get("price"));
    const stock = Number(f.get("stock"));
    if (!name || !(price >= 0) || !Number.isInteger(stock) || stock < 0) { toast.error("Check name, price (≥ 0) and stock (whole number ≥ 0)."); return; }
    const imageFile = f.get("image");
    let imageUrl = editing.image;

if (imageFile instanceof File && imageFile.size > 0) {
  const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filePath = `${editing.id}/${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from("products")
    .upload(filePath, imageFile);

  if (uploadError) {
    toast.error("Image upload failed: " + uploadError.message);
    return;
  }
  const { data } = supabase.storage
    .from("products")
    .getPublicUrl(filePath);

  imageUrl = data.publicUrl;
}
try {
  await upsertProduct({
    ...editing,
    name,
    price,
    stock,
    image: imageUrl,
    category: f.get("category") as CategoryId,
    brand: String(f.get("brand")),
    compatibility: String(f.get("compatibility")),
    description: String(f.get("description")),
  });
} catch (error) {
  console.error("Error saving product:", error);
  toast.error("Could not save product. Please try again.");
  return;
}

toast.success("Product saved");
setEditing(null);
  };
  if (authChecking) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        Checking admin access...
      </div>
    );
  } 
  

  if (authError) {
    return (
      <div className="p-8 text-center text-destructive" role="alert">
        {authError}
      </div>
    );
  } 
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">

      <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
  <div>
    <p className="eyebrow">Dashboard</p>
    <h1 className="mt-1 text-5xl font-bold">Shop admin</h1>
  </div>
</div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { i: Package, l: "Products", v: products.length },
          { i: Boxes, l: "Low / out of stock", v: low },
          { i: ClipboardList, l: "Orders", v: orders.length },
          { i: ClipboardList, l: "Order value", v: formatPrice(revenue) },
        ].map(({ i: I, l, v }) => (
          <div key={l} className="rounded-lg border border-border bg-card p-5">
            <I className="h-5 w-5 text-primary" />
            <p className="mt-3 font-display text-3xl font-bold">{v}</p>
            <p className="text-sm text-muted-foreground">{l}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 border-b border-border" role="tablist">
        {(["products", "orders"] as const).map((t) => (
          <button key={t} role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`-mb-px border-b-2 px-4 py-3 font-display uppercase tracking-widest ${tab === t ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}>{t}</button>
        ))}
      </div>

      {tab === "products" ? (
        <>
          <div className="mt-4 flex justify-end">
            <button onClick={() => setEditing({ id: `p-${Date.now().toString().slice(-5)}`, name: "", category: "engine", brand: "", compatibility: "", price: 0, stock: 0, image: engine, description: "" })}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-display uppercase tracking-widest text-primary-foreground"><Plus className="h-4 w-4" /> New product</button>
          </div>
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[720px] text-sm">
              <thead className="bg-card text-left text-xs uppercase tracking-widest text-muted-foreground">
                <tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3 text-right">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-card/60">
                    <td className="p-3"><div className="flex items-center gap-3"><img src={p.image} alt="" className="h-10 w-10 rounded object-cover" /><div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.id}</p></div></div></td>
                    <td className="p-3 text-muted-foreground">{categories.find((c) => c.id === p.category)?.name}</td>
                    <td className="p-3">{formatPrice(p.price)}</td>
                    <td className="p-3"><span className={p.stock <= 0 ? "text-muted-foreground" : p.stock <= 3 ? "font-semibold text-primary" : ""}>{p.stock}</span></td>
                    <td className="p-3 text-right">
                      <button onClick={() => setEditing(p)} className="p-2 hover:text-primary" aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></button>
                    <button
  onClick={async () => {
    if (!confirm(`Delete ${p.name}?`)) return;

    try {
      await deleteProduct(p.id);
      toast.success("Product deleted");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Could not delete product. Please try again.");
    }
  }}
  className="p-2 hover:text-primary"
  aria-label={`Delete ${p.name}`}
>
  <Trash2 className="h-4 w-4" />
</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {products.length === 0 && <p className="p-10 text-center text-muted-foreground">No products yet. Add your first product to the store.</p>}
          </div>
        </>
      ) : orders.length === 0 ? (
        <p className="mt-6 rounded-lg border border-dashed border-border p-12 text-center text-muted-foreground">No orders yet. Customer orders will appear here when they are placed.</p>
      ) : (
        <div className="mt-6 grid gap-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded-lg border border-border bg-card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div><p className="font-display text-xl font-bold">{o.id}</p><p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleString()}</p></div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-widest ${statusStyle[o.status]}`}>{o.status}</span>
                  <select aria-label="Change status" value={o.status} onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)} className="h-9 rounded-md border border-input bg-background px-2 text-sm">
                    {(["pending", "confirmed", "shipped", "cancelled"] as const).map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <div className="text-muted-foreground"><p className="font-semibold text-foreground">{o.customer.name}</p><p>{o.customer.phone}</p><p>{o.customer.address}, {o.customer.city}</p>{o.customer.note && <p className="mt-1 italic">“{o.customer.note}”</p>}</div>
                <ul className="space-y-1">{o.lines.map((l) => <li key={l.productId} className="flex justify-between"><span>{l.qty} × {l.name}</span><span>{formatPrice(l.price * l.qty)}</span></li>)}
                  <li className="flex justify-between border-t border-border pt-1 font-bold"><span>Total</span><span>{formatPrice(o.total)}</span></li></ul>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-background/80 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-label="Edit product">
          <form onSubmit={save} className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-border bg-card p-6">
            <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">{products.some((p) => p.id === editing.id) ? "Edit product" : "New product"}</h2>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close"><X className="h-5 w-5" /></button></div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-sm sm:col-span-2">Name<input name="name" required defaultValue={editing.name} className={input} /></label>
              <label className="text-sm">Category<select name="category" defaultValue={editing.category} className={input}>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
              <label className="text-sm">Brand<input name="brand" defaultValue={editing.brand} className={input} /></label>
              <label className="text-sm">Price (TND)<input name="price" type="number" min={0} step="0.001" defaultValue={editing.price} className={input} /></label>
              <label className="text-sm">Stock<input name="stock" type="number" min={0} step={1} defaultValue={editing.stock} className={input} /></label>
              <label className="text-sm sm:col-span-2">Compatibility<input name="compatibility" defaultValue={editing.compatibility} className={input} /></label>
              <label className="text-sm sm:col-span-2">Description<textarea name="description" rows={3} defaultValue={editing.description} className={`${input} h-auto py-2`} /></label>
              <label className="text-sm sm:col-span-2">
  Product Image
  <input
    name="image"
    type="file"
    accept="image/*"
    className={input}
  />
</label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setEditing(null)} className="rounded-md border border-border px-4 py-2">Cancel</button>
              <button className="rounded-md bg-primary px-5 py-2 font-display uppercase tracking-widest text-primary-foreground">Save</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}