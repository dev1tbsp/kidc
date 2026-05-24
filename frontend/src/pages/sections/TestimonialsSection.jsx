import { Star, Quote } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const BG = ["bg-pink-100", "bg-sky-100", "bg-amber-100", "bg-emerald-100", "bg-violet-100"];

export default function TestimonialsSection({ items = [] }) {
  const doubled = [...items, ...items];
  return (
    <section className="py-20 sm:py-28 overflow-hidden" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 mb-12">
        <SectionHeader
          overline="Real Reviews"
          title="Parents talk. We listen."
          subtitle="Every party gets a follow-up. Here's what real families said this year."
          align="center"
        />
      </div>

      <div className="relative">
        <div className="marquee py-4">
          {doubled.map((t, idx) => (
            <div
              key={`${t.id}-${idx}`}
              className={`shrink-0 w-[20rem] sm:w-[24rem] rounded-3xl p-7 ${BG[idx % BG.length]} bouncy`}
              data-testid={`testimonial-card-${idx}`}
            >
              <Quote className="w-8 h-8 text-slate-700 mb-3" />
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                ))}
              </div>
              <p className="text-slate-800 leading-relaxed mb-5 font-semibold">
                "{t.message}"
              </p>
              <div>
                <p className="font-heading text-lg font-bold text-slate-900">{t.parent_name}</p>
                <p className="text-xs text-slate-600 font-semibold">parent of {t.child_name} · {t.event_type}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
