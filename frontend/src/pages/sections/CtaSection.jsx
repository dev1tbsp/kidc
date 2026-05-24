import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export default function CtaSection() {
  return (
    <section className="py-20 sm:py-28" data-testid="cta-section">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-sky-500 to-sky-600 p-10 sm:p-16 overflow-hidden">
          <div className="absolute -top-10 -right-10 w-72 h-72 bg-amber-300/40 blob" />
          <div className="absolute -bottom-16 -left-10 w-80 h-80 bg-pink-300/30 blob" />
          <div className="relative grid md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Instant Quote
              </span>
              <h2 className="mt-5 font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                Get a real price in under 2 minutes.
              </h2>
              <p className="mt-4 text-white/90 text-lg max-w-md">
                Pick an age group, choose activities, tell us about your guests — we'll send a clear quote, fast.
              </p>
            </div>
            <div className="md:justify-self-end w-full md:w-auto">
              <Link to="/quote" data-testid="cta-quote-button">
                <Button className="w-full md:w-auto rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black px-10 py-8 text-xl shadow-2xl shadow-amber-500/40 hover:-translate-y-1 transition">
                  Start my quote →
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
