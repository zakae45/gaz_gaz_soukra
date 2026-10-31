import { createFileRoute } from "@tanstack/react-router";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";

// PLACEHOLDER contact details — replace with the shop's real number, address and hours.
const WHATSAPP_NUMBER = "21600000000";
const PHONE_DISPLAY = "+216 00 000 000 (placeholder)";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact & WhatsApp — Gaz Gaz Soukra" },
      { name: "description", content: "Contact Gaz Gaz Soukra on WhatsApp or visit the shop in La Soukra, Tunisia." },
      { property: "og:title", content: "Contact Gaz Gaz Soukra" },
      { property: "og:description", content: "Message us on WhatsApp or visit the shop in La Soukra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const wa = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Bonjour Gaz Gaz Soukra, je cherche une pièce pour ma moto :")}`;
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
      <p className="eyebrow">Get in touch</p>
      <h1 className="mt-2 text-5xl font-bold md:text-7xl">Talk to the shop</h1>
      <p className="mt-4 max-w-xl text-muted-foreground">Send your bike model and the part you need. We'll reply with availability.</p>
      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        <a href={wa} target="_blank" rel="noopener noreferrer"
          className="group flex flex-col justify-between rounded-xl border border-primary/50 bg-card p-8 transition-all hover:-translate-y-1 hover:shadow-glow">
          <MessageCircle className="h-10 w-10 text-primary" />
          <div className="mt-12">
            <p className="font-display text-4xl font-bold uppercase">WhatsApp</p>
            <p className="mt-1 text-muted-foreground">Fastest way to ask about a part.</p>
            <span className="mt-6 inline-flex rounded-md bg-primary px-6 py-3 font-display uppercase tracking-widest text-primary-foreground">Open chat</span>
          </div>
        </a>
        <div className="grid gap-4">
          {[
            { icon: Phone, t: "Phone", d: PHONE_DISPLAY },
            { icon: MapPin, t: "Address", d: "La Soukra, Ariana, Tunisia (exact address to confirm)" },
            { icon: Clock, t: "Opening hours", d: "To be confirmed by the shop" },
          ].map(({ icon: I, t, d }) => (
            <div key={t} className="flex items-start gap-4 rounded-xl border border-border bg-card p-6">
              <I className="mt-1 h-6 w-6 text-primary" />
              <div><p className="font-display text-xl font-semibold uppercase">{t}</p><p className="text-muted-foreground">{d}</p></div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border border-border">
        <iframe title="Map of La Soukra" src="https://www.openstreetmap.org/export/embed.html?bbox=10.17%2C36.85%2C10.24%2C36.89&layer=mapnik"
          className="h-80 w-full grayscale invert-[0.9]" loading="lazy" />
      </div>
    </div>
  );
}
