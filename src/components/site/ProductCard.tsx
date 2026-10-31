import { Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { formatPrice, type Product } from "@/data/products";
import { useStore } from "@/lib/store";

export function StockBadge({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Out of stock</span>;
  if (stock <= 3) return <span className="text-xs font-semibold uppercase tracking-wider text-primary">Only {stock} left</span>;
  return <span className="text-xs font-semibold uppercase tracking-wider text-success">In stock</span>;
}

export function ProductCard({ product }: { product: Product }) {
  const { addToCart } = useStore();
  const out = product.stock <= 0;
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:border-primary/60 hover:shadow-glow">
      <Link to="/product/$id" params={{ id: product.id }} className="relative block aspect-square overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} loading="lazy" width={1024} height={1024}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <span className="absolute left-3 top-3 rounded-sm bg-background/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Sample</span>
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <StockBadge stock={product.stock} />
        <Link to="/product/$id" params={{ id: product.id }} className="font-display text-lg font-semibold uppercase leading-tight hover:text-primary">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground">{product.compatibility}</p>
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="font-display text-xl font-bold">{formatPrice(product.price)}</span>
          <button disabled={out} onClick={() => { addToCart(product.id); toast.success(`${product.name} added to cart`); }}
            aria-label={`Add ${product.name} to cart`}
            className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground">
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  );
}
