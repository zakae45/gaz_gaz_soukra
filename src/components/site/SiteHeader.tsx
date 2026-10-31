import { Link } from "@tanstack/react-router";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { useStore } from "@/lib/store";

const nav = [
  { to: "/", label: "Home" },
  { to: "/shop", label: "Shop" },
  { to: "/contact", label: "Contact" },
  { to: "/admin", label: "Admin" },
] as const;

export function SiteHeader() {
  const { cartCount } = useStore();
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
        <Link to="/" className="flex items-center gap-2" aria-label="Gaz Gaz Soukra home">
          <span className="racing-stripe h-6 w-3 rounded-sm" />
          <span className="font-display text-2xl font-bold uppercase tracking-wide">
            Gaz Gaz <span className="text-primary">Soukra</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} activeOptions={{ exact: n.to === "/" }}
              className="font-display text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-foreground" }}>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/cart" className="relative rounded-md p-2 transition-colors hover:bg-accent" aria-label={`Cart, ${cartCount} items`}>
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-bold text-primary-foreground">{cartCount}</span>
            )}
          </Link>
          <button className="rounded-md p-2 hover:bg-accent md:hidden" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-border px-4 py-3 md:hidden" aria-label="Mobile">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-3 font-display text-lg uppercase tracking-widest">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
