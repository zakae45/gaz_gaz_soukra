import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, SearchX } from "lucide-react";
import { useMemo } from "react";
import { categories, type CategoryId } from "@/data/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";

type Sort = "featured" | "price-asc" | "price-desc" | "name";
interface ShopSearch { q?: string | undefined; category?: CategoryId | undefined; sort?: Sort | undefined; inStock?: boolean | undefined }

export const Route = createFileRoute("/shop")({
  validateSearch: (s: Record<string, unknown>): ShopSearch => ({
  q: typeof s["q"] === "string" && s["q"] ? s["q"] : undefined,
  category: categories.some((c) => c.id === s["category"])
    ? (s["category"] as CategoryId)
    : undefined,
  sort: ["featured", "price-asc", "price-desc", "name"].includes(s["sort"] as string)
    ? (s["sort"] as Sort)
    : undefined,
  inStock: s["inStock"] === true || s["inStock"] === "true" ? true : undefined,
}),
  head: () => ({
    meta: [
      { title: "Shop Motorcycle Parts — Gaz Gaz Soukra" },
      { name: "description", content: "Search and filter engine, brake, transmission parts and accessories." },
      { property: "og:title", content: "Shop Motorcycle Parts — Gaz Gaz Soukra" },
      { property: "og:description", content: "Search and filter motorcycle spare parts by category and price." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Shop,
});

function Shop() {
  const { q = "", category, sort = "featured", inStock } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { products } = useStore();
  const set = (patch: Partial<ShopSearch>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const r = products.filter((p) =>
      (!category || p.category === category) &&
      (!inStock || p.stock > 0) &&
      (!term || `${p.name} ${p.brand} ${p.compatibility}`.toLowerCase().includes(term)));
    const sorted = [...r];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "name") sorted.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "featured") sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return sorted;
  }, [products, q, category, sort, inStock]);

  const chip = "rounded-full border px-4 py-1.5 font-display text-sm font-semibold uppercase tracking-widest transition-colors";
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <p className="eyebrow">Catalog</p>
      <h1 className="mt-2 text-5xl font-bold md:text-6xl">All parts</h1>
      <p className="mt-2 text-xs text-muted-foreground">Sample products — prices and stock are placeholders.</p>

      <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Search parts</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={q} onChange={(e) => set({ q: e.target.value || undefined })} placeholder="Search by part, brand or model…"
            className="h-11 w-full rounded-md border border-input bg-card pl-10 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40" />
        </label>
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" checked={!!inStock} onChange={(e) => set({ inStock: e.target.checked || undefined })} className="h-4 w-4 accent-primary" />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Sort</span>
          <select value={sort} onChange={(e) => set({ sort: e.target.value as Sort })} className="h-11 rounded-md border border-input bg-card px-3 text-sm outline-none focus:border-primary">
            <option value="featured">Featured</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="name">Name A–Z</option>
          </select>
        </label>
      </div>

      <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        <button onClick={() => set({ category: undefined })} aria-pressed={!category}
          className={`${chip} ${!category ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>All</button>
        {categories.map((c) => (
          <button key={c.id} onClick={() => set({ category: c.id })} aria-pressed={category === c.id}
            className={`${chip} ${category === c.id ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"}`}>{c.name}</button>
        ))}
      </div>

      <p className="mt-6 text-sm text-muted-foreground" aria-live="polite">{list.length} {list.length === 1 ? "product" : "products"}</p>
      {list.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-lg border border-dashed border-border py-20 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" />
          <p className="mt-4 font-display text-2xl uppercase">No parts found</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another search term or clear the filters.</p>
          <button onClick={() => navigate({ search: {}, replace: true })} className="mt-6 rounded-md border border-border px-5 py-2 font-display uppercase tracking-widest hover:border-primary">Clear filters</button>
        </div>
      ) : (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      )}
    </div>
  );
}
