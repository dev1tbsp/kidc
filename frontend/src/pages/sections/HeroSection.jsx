import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Star } from "lucide-react";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1530104091755-015d31dfa0b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxraWRzJTIwYmlydGhkYXklMjBwYXJ0eSUyMHBsYXlpbmclMjBiYWxsb29uc3xlbnwwfHx8fDE3Nzk2MTQ3MTl8MA&ixlib=rb-4.1.0&q=85";

export default function HeroSection() {
  return (
    <section className="relative pt-16 pb-24 sm:pt-20 sm:pb-32 overflow-hidden" data-testid="hero-section">
      <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] bg-sky-300 blob" />
      <div className="absolute top-40 -right-32 w-[32rem] h-[32rem] bg-amber-300 blob" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-pink-300 blob" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          <div className="lg:col-span-7 stagger">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border-2 border-amber-300 text-amber-700 font-bold text-sm shadow-sm">
              <Sparkles className="w-4 h-4" />
              <span>Award-winning kids party catering</span>
            </div>
            <h1 className="mt-6 font-heading text-5xl sm:text-6xl lg:text-7xl font-black text-slate-900 leading-[1.02] tracking-tight">
              Birthdays so <span className="relative inline-block">
                <span className="relative z-10 text-sky-600">magical</span>
                <span className="absolute inset-x-0 bottom-2 h-3 bg-amber-300 -z-0 rounded-full"></span>
              </span>,<br />
              kids never forget.
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-slate-700 leading-relaxed max-w-2xl">
              We design end-to-end parties — themed catering, snack boxes, magic shows, slime labs and more — tailored by age, so you can just show up and celebrate.
            </p>

            <div className="mt-9 flex flex-wrap gap-4">
              <Link to="/quote" data-testid="hero-quote-cta">
                <Button className="rounded-full bg-sky-500 hover:bg-sky-600 text-white font-bold px-8 py-7 text-lg shadow-xl shadow-sky-500/30 hover:-translate-y-1 transition">
                  Build my party <ArrowRight className="w-5 h-5 ml-1" />
                </Button>
              </Link>
              <Link to="/packages" data-testid="hero-packages-cta">
                <Button variant="outline" className="rounded-full border-2 border-slate-300 hover:border-slate-900 text-slate-900 font-bold px-8 py-7 text-lg bg-white">
                  See packages
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex items-center gap-6">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-11 h-11 rounded-full border-4 border-white ${
                    i===1?"bg-pink-300":i===2?"bg-sky-300":i===3?"bg-amber-300":"bg-emerald-300"
                  }`} />
                ))}
              </div>
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {[1,2,3,4,5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                  <span className="ml-2 text-slate-900 font-bold">4.9</span>
                </div>
                <p className="text-sm text-slate-600">500+ happy families</p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 relative">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-sky-300 via-amber-200 to-pink-300 rounded-[3rem] rotate-3"></div>
              <img
                src={HERO_IMAGE}
                alt="Kids enjoying a birthday party"
                className="relative w-full h-[28rem] sm:h-[34rem] object-cover rounded-[2.5rem] shadow-2xl"
                data-testid="hero-image"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-3xl shadow-xl p-4 flex items-center gap-3 bouncy">
                <span className="w-12 h-12 rounded-2xl bg-emerald-100 grid place-items-center text-emerald-600 text-2xl">🎂</span>
                <div>
                  <p className="font-heading text-2xl font-bold text-slate-900">3,200+</p>
                  <p className="text-xs text-slate-600 font-semibold">parties hosted</p>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-amber-400 text-slate-900 rounded-3xl shadow-xl px-5 py-3 bouncy">
                <p className="font-heading font-bold text-lg">🎈 Free Décor</p>
                <p className="text-xs font-bold">on all packages</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
