import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { categories, formatPrice } from "@/data/products";
import { useStore } from "@/lib/store";
import { ProductCard, StockBadge } from "@/components/site/ProductCard";

export const Route = createFileRoute("/product/$id")({
  head: () => ({
    meta: [
      { title: "Product details — Gaz Gaz Soukra" },
      { name: "description", content: "Motorcycle part details, compatibility and availability." },
      { property: "og:title", content: "Product details — Gaz Gaz Soukra" },
      { property: "og:description", content: "Motorcycle part details, compatibility and availability." },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { products, addToCart } = useStore();
  const [qty, setQty] = useState(1);
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="mx-auto max-w-md px-4 py-32 text-center">
        <h1 className="text-4xl font-bold">Product not found</h1>
        <p className="mt-2 text-muted-foreground">This part may have been removed.</p>
        <Link to="/shop" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2.5 font-display uppercase tracking-widest text-primary-foreground">Back to shop</Link>
      </div>
    );
  }
  const cat = categories.find((c) => c.id === product.category);
  const related = products.filter((p) => p.category === product.category && p.id !== product.id).slice(0, 4);
  const out = product.stock <= 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
      <Link to="/shop" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Back to shop</Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card">
          <img src={product.image} alt={product.name} width={1024} height={1024} className="aspect-square w-full object-cover" />
          <span className="absolute left-4 top-4 rounded-sm bg-background/80 px-2 py-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Sample product</span>
        </div>
        <div className="flex flex-col">
          <p className="eyebrow">{cat?.name}</p>
          <h1 className="mt-2 text-5xl font-bold leading-none md:text-6xl">{product.name}</h1>
          <div className="mt-4"><StockBadge stock={product.stock} /></div>
          <p className="mt-6 font-display text-4xl font-bold">{formatPrice(product.price)}</p>
          <p className="text-xs text-muted-foreground">Placeholder price</p>
          <p className="mt-6 text-muted-foreground">{product.description}</p>
          <dl className="mt-6 grid grid-cols-2 gap-4 border-y border-border py-5 text-sm">
            <div><dt className="text-muted-foreground">Brand</dt><dd className="font-semibold">{product.brand}</dd></div>
            <div><dt className="text-muted-foreground">Compatibility</dt><dd className="font-semibold">{product.compatibility}</dd></div>
            <div><dt className="text-muted-foreground">Reference</dt><dd className="font-semibold">{product.id.toUpperCase()}</dd></div>
            <div><dt className="text-muted-foreground">Stock</dt><dd className="font-semibold">{product.stock}</dd></div>
          </dl>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-md border border-input">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="p-3 hover:text-primary" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
              <span className="w-10 text-center font-semibold" aria-live="polite">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="p-3 hover:text-primary" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
            </div>
            <button disabled={out} onClick={() => { addToCart(product.id, qty); toast.success(`${qty} × ${product.name} added to cart`); }}
              className="flex-1 rounded-md bg-primary px-8 py-3.5 font-display text-lg font-semibold uppercase tracking-widest text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:shadow-none">
              {out ? "Out of stock" : "Add to cart"}
            </button>
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="text-3xl font-bold">Related parts</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{related.map((p) => <ProductCard key={p.id} product={p} />)}</div>
        </section>
      )}
    </div>
  );
}
