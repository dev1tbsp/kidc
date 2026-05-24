import { Link } from "react-router-dom";
import { Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";

const STYLES = {
  pink: { ring: "ring-pink-200", btn: "bg-pink-500 hover:bg-pink-600", tag: "bg-pink-100 text-pink-700" },
  sky:  { ring: "ring-sky-200", btn: "bg-sky-500 hover:bg-sky-600", tag: "bg-sky-100 text-sky-700" },
  amber:{ ring: "ring-amber-200", btn: "bg-amber-500 hover:bg-amber-600 text-slate-900", tag: "bg-amber-100 text-amber-700" },
};

export default function PackagesSection({ items = [] }) {
  return (
    <section className="py-20 sm:py-28" id="packages" data-testid="packages-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader
          overline="Catering Packages"
          title="Three ways to party. Pick yours."
          subtitle="All packages include themed décor, dedicated hosts, custom cakes & a stress-free setup. Just add the kids."
        />

        <div className="grid lg:grid-cols-3 gap-7">
          {items.map((p, idx) => {
            const s = STYLES[p.color] || STYLES.sky;
            return (
              <div
                key={p.id}
                className={`relative bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 ring-2 ${s.ring} ${
                  p.popular ? "lg:scale-105 lg:-translate-y-2" : ""
                } bouncy`}
                data-testid={`package-card-${idx}`}
              >
                {p.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-amber-400 text-slate-900 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-current" /> Most Popular
                  </div>
                )}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${s.tag} mb-4`}>
                  {p.tagline}
                </span>
                <h3 className="font-heading text-3xl font-bold text-slate-900 mb-2">{p.name}</h3>
                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-heading text-5xl font-black text-slate-900">${p.price_per_child}</span>
                  <span className="text-slate-500 text-sm font-semibold">/ child</span>
                </div>
                <p className="text-slate-500 text-xs font-bold mb-4">
                  MIN {p.min_guests} GUESTS
                </p>
                <ul className="space-y-2.5 mb-7">
                  {p.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                      <Check className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/quote" state={{ packageId: p.id }} data-testid={`package-cta-${idx}`}>
                  <Button className={`w-full rounded-full ${s.btn} text-white font-bold py-6 shadow-lg`}>
                    Build with {p.name}
                  </Button>
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
