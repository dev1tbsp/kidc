import { Wand2, PartyPopper, Palette, Map, FlaskConical, Camera, Sparkles } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const ICONS = { Wand2, PartyPopper, Palette, Map, FlaskConical, Camera, Sparkles };
const PALETTES = [
  { bg: "bg-sky-50", icon: "bg-sky-100 text-sky-600", border: "border-sky-200" },
  { bg: "bg-amber-50", icon: "bg-amber-100 text-amber-700", border: "border-amber-200" },
  { bg: "bg-pink-50", icon: "bg-pink-100 text-pink-700", border: "border-pink-200" },
  { bg: "bg-emerald-50", icon: "bg-emerald-100 text-emerald-700", border: "border-emerald-200" },
  { bg: "bg-violet-50", icon: "bg-violet-100 text-violet-700", border: "border-violet-200" },
  { bg: "bg-rose-50", icon: "bg-rose-100 text-rose-700", border: "border-rose-200" },
];

export default function ActivitiesSection({ items = [] }) {
  return (
    <section className="py-20 sm:py-28 relative bg-slate-50" data-testid="activities-section">
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader
          overline="Activities"
          title="The fun isn't optional."
          subtitle="Every package comes packed with activities the kids actually want to do."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a, idx) => {
            const Icon = ICONS[a.icon] || Sparkles;
            const p = PALETTES[idx % PALETTES.length];
            return (
              <div
                key={a.id}
                className={`bouncy ${p.bg} rounded-3xl p-7 border-2 ${p.border}`}
                data-testid={`activity-card-${idx}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-2xl ${p.icon} grid place-items-center shrink-0`}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-slate-900 mb-1">
                      {a.name}
                    </h3>
                    <p className="text-slate-700 text-sm leading-relaxed">
                      {a.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
