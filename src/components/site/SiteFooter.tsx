import { Link } from "@tanstack/react-router";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border bg-sidebar">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-3 md:px-8">
        <div>
          <p className="font-display text-2xl font-bold uppercase">Gaz Gaz <span className="text-primary">Soukra</span></p>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">Motorcycle spare parts shop in La Soukra, Tunisia.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          <p className="eyebrow mb-1">Explore</p>
          <Link to="/shop" className="text-muted-foreground hover:text-foreground">Shop all parts</Link>
          <Link to="/cart" className="text-muted-foreground hover:text-foreground">Cart</Link>
          <Link to="/contact" className="text-muted-foreground hover:text-foreground">Contact & WhatsApp</Link>
        </div>
        <div className="text-sm text-muted-foreground">
          <p className="eyebrow mb-3">Note</p>
          <p>Products, prices and stock currently shown are sample data for demonstration.</p>
        </div>
      </div>
      <div className="border-t border-border py-5 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Gaz Gaz Soukra</div>
    </footer>
  );
}
