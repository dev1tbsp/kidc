import { Baby, Sparkles, Rocket, Trophy, Cake } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

const ICONS = { Baby, Sparkles, Rocket, Trophy, Cake };
const COLORS = {
  pink:    { bg: "bg-pink-100",   text: "text-pink-700",    accent: "bg-pink-400",    ring: "ring-pink-200" },
  amber:   { bg: "bg-amber-100",  text: "text-amber-700",   accent: "bg-amber-400",   ring: "ring-amber-200" },
  sky:     { bg: "bg-sky-100",    text: "text-sky-700",     accent: "bg-sky-400",     ring: "ring-sky-200" },
  emerald: { bg: "bg-emerald-100",text: "text-emerald-700", accent: "bg-emerald-400", ring: "ring-emerald-200" },
};

export default function AgeGroupsSection({ items = [] }) {
  return (
    <section className="py-20 sm:py-28 relative" data-testid="age-groups-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader
          overline="By Age Group"
          title="One party isn't enough for every kid."
          subtitle="We design experiences tailored to your child's age — every activity, every snack, every moment fits."
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((g, idx) => {
            const Icon = ICONS[g.icon] || Cake;
            const c = COLORS[g.color] || COLORS.sky;
            return (
              <div
                key={g.id}
                className={`bouncy bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/60 border-2 ${c.ring} ring-2 hover:ring-4 transition cursor-pointer`}
                data-testid={`age-group-card-${idx}`}
              >
                <div className={`w-14 h-14 rounded-2xl ${c.bg} grid place-items-center mb-5`}>
                  <Icon className={`w-7 h-7 ${c.text}`} />
                </div>
                <p className={`text-xs font-black uppercase tracking-wider ${c.text} mb-1`}>
                  {g.age_range}
                </p>
                <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">
                  {g.name}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  {g.description}
                </p>
                <div className={`mt-5 h-1.5 w-12 rounded-full ${c.accent}`}></div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
