import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, MessageCircle, ShieldCheck, Truck, Wrench } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { categories } from "@/data/products";
import { useStore } from "@/lib/store";
import { ProductCard } from "@/components/site/ProductCard";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gaz Gaz Soukra — Motorcycle Spare Parts in Tunisia" },
      { name: "description", content: "Engine, brake, transmission parts and riding gear. Browse the catalog and order from Gaz Gaz Soukra." },
      { property: "og:title", content: "Gaz Gaz Soukra — Motorcycle Spare Parts" },
      { property: "og:description", content: "Engine, brake, transmission parts and riding gear from La Soukra, Tunisia." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  const { products } = useStore();
  const featured = products.filter((p) => p.featured).slice(0, 4);
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img src={hero} alt="Sport motorcycle in a dark garage" width={1920} height={1088} className="absolute inset-0 -z-20 h-full w-full object-cover" />
        <div className="bg-hero-fade absolute inset-0 -z-10" />
        <div className="bg-bottom-fade absolute inset-x-0 bottom-0 -z-10 h-40" />
        <div className="mx-auto flex min-h-[78vh] max-w-7xl flex-col justify-center px-4 py-24 md:px-8">
          <p className="eyebrow animate-rise">La Soukra · Tunisia</p>
          <h1 className="animate-rise mt-4 max-w-3xl text-6xl font-extrabold leading-[0.9] md:text-8xl" style={{ animationDelay: "80ms" }}>
            Parts that keep<br /><span className="text-primary">you riding.</span>
          </h1>
          <p className="animate-rise mt-6 max-w-lg text-lg text-muted-foreground" style={{ animationDelay: "160ms" }}>
            Engine, brakes, transmission and riding gear for scooters and motorcycles.
          </p>
          <div className="animate-rise mt-10 flex flex-wrap gap-3" style={{ animationDelay: "240ms" }}>
            <Link to="/shop" className="group inline-flex items-center gap-2 rounded-md bg-primary px-7 py-3.5 font-display text-lg font-semibold uppercase tracking-widest text-primary-foreground shadow-glow transition-transform hover:-translate-y-0.5">
              Shop parts <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-md border border-ivory/30 px-7 py-3.5 font-display text-lg font-semibold uppercase tracking-widest transition-colors hover:border-ivory hover:bg-ivory/5">
              <MessageCircle className="h-5 w-5" /> Ask on WhatsApp
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-sidebar">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-3 md:px-8">
          {[
            { icon: Wrench, t: "Find the right part", d: "Tell us your model — we help match it." },
            { icon: Truck, t: "Order online", d: "Simple order request, confirmed by phone." },
            { icon: ShieldCheck, t: "No card needed", d: "No payment details collected on this site." },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="flex items-start gap-4">
              <I className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div><p className="font-display text-lg font-semibold uppercase">{t}</p><p className="text-sm text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <p className="eyebrow">Categories</p>
        <h2 className="mt-2 text-4xl font-bold md:text-5xl">Shop by system</h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c) => (
            <Link key={c.id} to="/shop" search={{ category: c.id }} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-border">
              <img src={c.image} alt={c.name} loading="lazy" width={1024} height={1024} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="bg-bottom-fade absolute inset-0" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="font-display text-2xl font-bold uppercase">{c.name}</p>
                <p className="text-sm text-muted-foreground">{c.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold uppercase tracking-widest text-primary">Browse <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="flex items-end justify-between gap-4">
          <div><p className="eyebrow">Featured</p><h2 className="mt-2 text-4xl font-bold md:text-5xl">Popular parts</h2></div>
          <Link to="/shop" className="hidden items-center gap-1 font-display uppercase tracking-widest text-muted-foreground hover:text-foreground sm:inline-flex">View all <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">Sample products — prices and stock are placeholders.</p>
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p.id} product={p} />)}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pt-20 md:px-8">
        <div className="relative overflow-hidden rounded-xl border border-border bg-card p-10 md:p-14">
          <div className="racing-stripe absolute right-0 top-0 h-full w-24 opacity-20" />
          <h2 className="max-w-xl text-4xl font-bold md:text-5xl">Can't find your part?</h2>
          <p className="mt-3 max-w-lg text-muted-foreground">Send us your bike model and the part you need — we'll check availability for you.</p>
          <Link to="/contact" className="mt-8 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-display font-semibold uppercase tracking-widest text-primary-foreground">Contact the shop <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
