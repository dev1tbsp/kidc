import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import { ArrowRight } from "lucide-react";

export default function SnackBoxesSection({ items = [] }) {
  return (
    <section className="py-20 sm:py-28 relative overflow-hidden" data-testid="snack-boxes-section">
      <div className="absolute top-20 -left-20 w-72 h-72 bg-pink-200 blob" />
      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader
          overline="Snack Boxes & Packed Food"
          title="Lunchbox magic. Every. Single. Kid."
          subtitle="Themed grab-and-go boxes built around dietary preferences, with hot food options on demand."
        />

        <div className="grid lg:grid-cols-3 gap-6">
          {items.map((box, idx) => (
            <div
              key={box.id}
              className="bouncy bg-white rounded-3xl overflow-hidden shadow-xl shadow-slate-200/60 border-2 border-slate-100"
              data-testid={`snack-box-card-${idx}`}
            >
              {box.image && (
                <div className="relative h-56 overflow-hidden">
                  <img src={box.image} alt={box.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 right-4 bg-white rounded-2xl px-4 py-2 shadow-lg">
                    <span className="font-heading text-2xl font-black text-slate-900">₹{box.price}</span>
                    <span className="text-xs text-slate-500 font-bold ml-1">/box</span>
                  </div>
                </div>
              )}
              <div className="p-7">
                <h3 className="font-heading text-2xl font-bold text-slate-900 mb-2">{box.name}</h3>
                <p className="text-slate-600 text-sm mb-4 leading-relaxed">{box.description}</p>
                <div className="flex flex-wrap gap-2">
                  {box.items.map((item, i) => (
                    <span key={i} className="text-xs font-bold px-3 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/quote" data-testid="snack-quote-cta">
            <Button className="rounded-full bg-pink-500 hover:bg-pink-600 text-white font-bold px-8 py-7 text-lg shadow-xl shadow-pink-500/30">
              Add boxes to your party <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
