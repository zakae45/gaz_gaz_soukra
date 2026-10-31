import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { formatPrice } from "@/data/products";
import { useStore, type Order } from "@/lib/store";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your cart — Gaz Gaz Soukra" },
      { name: "description", content: "Review your parts and send your order request." },
      { property: "og:title", content: "Your cart — Gaz Gaz Soukra" },
      { property: "og:description", content: "Review your parts and send your order request." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CartPage,
});

const field = "h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/40";

function CartPage() {
  const { cart, products, setQty, removeFromCart, cartTotal, placeOrder } = useStore();
  const [step, setStep] = useState<"cart" | "details">("cart");
  const [done, setDone] = useState<Order | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <CheckCircle2 className="mx-auto h-14 w-14 text-success" />
        <h1 className="mt-6 text-5xl font-bold">Order request sent</h1>
       <p className="mt-3 text-muted-foreground">Your order has been sent successfully. The shop will contact you to confirm your order. Keep your reference number for follow-up.</p>
        <Link to="/shop" className="mt-8 inline-flex rounded-md bg-primary px-6 py-3 font-display uppercase tracking-widest text-primary-foreground">Continue shopping</Link>
      </div>
    );
  }

  const lines = cart.map((l) => ({ ...l, product: products.find((p) => p.id === l.productId) })).filter((l) => l.product);

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
        <h1 className="mt-6 text-5xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">Browse the catalog and add the parts you need.</p>
        <Link to="/shop" className="mt-8 inline-flex rounded-md bg-primary px-6 py-3 font-display uppercase tracking-widest text-primary-foreground">Shop parts</Link>
      </div>
    );
  }

  const submit = async (e: FormEvent<HTMLFormElement>) => { 
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const c = {
      name: String(f.get("name") ?? "").trim(),
      phone: String(f.get("phone") ?? "").trim(),
      city: String(f.get("city") ?? "").trim(),
      address: String(f.get("address") ?? "").trim(),
      note: String(f.get("note") ?? "").trim(),
    };
    const err: Record<string, string> = {};
    if (c.name.length < 2) err["name"] = "Please enter your full name.";
    if (!/^(\+216)?\s?\d{8}$/.test(c.phone.replace(/\s/g, ""))) err["phone"] = "Enter a valid Tunisian phone number (8 digits).";
    if (!c.city) err["city"] = "Please enter your city.";
    if (c.address.length < 4) err["address"] = "Please enter a delivery address.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setDone(await placeOrder(c));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <p className="eyebrow">{step === "cart" ? "Step 1 of 2" : "Step 2 of 2"}</p>
      <h1 className="mt-2 text-5xl font-bold md:text-6xl">{step === "cart" ? "Your cart" : "Your details"}</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_380px]">
        {step === "cart" ? (
          <ul className="divide-y divide-border rounded-lg border border-border bg-card">
            {lines.map(({ product: p, qty }) => p && (
              <li key={p.id} className="flex gap-4 p-4">
                <img src={p.image} alt={p.name} loading="lazy" width={96} height={96} className="h-24 w-24 rounded-md object-cover" />
                <div className="flex flex-1 flex-col">
                  <Link to="/product/$id" params={{ id: p.id }} className="font-display text-lg font-semibold uppercase hover:text-primary">{p.name}</Link>
                  <p className="text-sm text-muted-foreground">{formatPrice(p.price)} each</p>
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <div className="flex items-center rounded-md border border-input">
                      <button onClick={() => setQty(p.id, qty - 1)} className="p-2 hover:text-primary" aria-label="Decrease quantity"><Minus className="h-4 w-4" /></button>
                      <span className="w-8 text-center text-sm font-semibold">{qty}</span>
                      <button onClick={() => setQty(p.id, qty + 1)} className="p-2 hover:text-primary" aria-label="Increase quantity"><Plus className="h-4 w-4" /></button>
                    </div>
                    <button onClick={() => removeFromCart(p.id)} className="p-2 text-muted-foreground hover:text-primary" aria-label={`Remove ${p.name}`}><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <p className="font-display text-lg font-bold">{formatPrice(p.price * qty)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <form id="order-form" onSubmit={submit} noValidate className="grid gap-4 rounded-lg border border-border bg-card p-6 sm:grid-cols-2">
            {[
              { n: "name", l: "Full name", t: "text", ac: "name" },
              { n: "phone", l: "Phone", t: "tel", ac: "tel" },
              { n: "city", l: "City", t: "text", ac: "address-level2" },
              { n: "address", l: "Address", t: "text", ac: "street-address" },
            ].map((x) => (
              <label key={x.n} className="flex flex-col gap-1.5 text-sm">
                <span className="font-semibold">{x.l}</span>
                <input name={x.n} type={x.t} autoComplete={x.ac} className={field} aria-invalid={!!errors[x.n]} />
                {errors[x.n] && <span className="text-xs text-destructive">{errors[x.n]}</span>}
              </label>
            ))}
            <label className="flex flex-col gap-1.5 text-sm sm:col-span-2">
              <span className="font-semibold">Note (bike model, etc.) — optional</span>
              <textarea name="note" rows={3} className={`${field} h-auto py-2`} />
            </label>
            <p className="text-xs text-muted-foreground sm:col-span-2">Payment on delivery or in shop. No card details are collected on this site.</p>
          </form>
        )}
        <aside className="h-fit rounded-lg border border-border bg-card p-6 lg:sticky lg:top-24">
          <h2 className="text-2xl font-bold">Summary</h2>
          <div className="mt-4 flex justify-between text-sm text-muted-foreground"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
          <div className="mt-2 flex justify-between text-sm text-muted-foreground"><span>Delivery</span><span>Confirmed by phone</span></div>
          <div className="mt-4 flex justify-between border-t border-border pt-4 font-display text-2xl font-bold"><span>Total</span><span>{formatPrice(cartTotal)}</span></div>
          {step === "cart" ? (
            <button onClick={() => setStep("details")} className="mt-6 w-full rounded-md bg-primary py-3.5 font-display text-lg font-semibold uppercase tracking-widest text-primary-foreground shadow-glow">Continue</button>
          ) : (
            <>
              <button type="submit" form="order-form" className="mt-6 w-full rounded-md bg-primary py-3.5 font-display text-lg font-semibold uppercase tracking-widest text-primary-foreground shadow-glow">Send order request</button>
              <button onClick={() => setStep("cart")} className="mt-2 w-full py-2 text-sm text-muted-foreground hover:text-foreground">Back to cart</button>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
