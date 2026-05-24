import { Mail, Phone, MapPin, Instagram, Facebook } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import useSEO from "@/lib/useSEO";

export default function ContactPage() {
  useSEO({
    title: "Contact — Kids Feast Catering",
    description: "Get in touch with Kids Feast: phone, email, social, address. Or skip ahead and build a quote in minutes.",
  });

  return (
    <div className="py-16 sm:py-24" data-testid="contact-page">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-14">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-500 mb-3">Contact</p>
          <h1 className="font-heading text-5xl sm:text-6xl font-black text-slate-900">Let's chat parties.</h1>
          <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
            We respond within a few hours. For instant pricing, build a quote — otherwise the lines are always open.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {[
            { icon: Phone, label: "Call us", value: "+1 (555) 123-KIDS", href: "tel:+15551235437", color: "bg-sky-100 text-sky-700" },
            { icon: Mail, label: "Email us", value: "hello@kidsfeast.com", href: "mailto:hello@kidsfeast.com", color: "bg-amber-100 text-amber-700" },
            { icon: MapPin, label: "Visit us", value: "123 Party Lane, Funtown", href: "#", color: "bg-pink-100 text-pink-700" },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <a key={i} href={c.href} className="bouncy bg-white rounded-3xl p-7 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100 block" data-testid={`contact-card-${i}`}>
                <div className={`w-14 h-14 rounded-2xl ${c.color} grid place-items-center mb-4`}>
                  <Icon className="w-7 h-7" />
                </div>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{c.label}</p>
                <p className="font-heading text-xl font-bold text-slate-900 mt-1">{c.value}</p>
              </a>
            );
          })}
        </div>

        <div className="bg-gradient-to-br from-sky-500 to-sky-600 rounded-[2.5rem] p-10 sm:p-14 text-center text-white">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold">Skip the back-and-forth.</h2>
          <p className="text-sky-100 mt-3 max-w-md mx-auto">Use the quote builder — you'll have a full estimate in your inbox before you finish your coffee.</p>
          <div className="mt-6 flex items-center justify-center gap-3 flex-wrap">
            <Link to="/quote" data-testid="contact-quote-cta">
              <Button className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-black px-8 py-7 text-lg">
                Build my quote
              </Button>
            </Link>
            <div className="flex gap-2">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/15 grid place-items-center hover:bg-white/25"><Instagram className="w-5 h-5" /></a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-white/15 grid place-items-center hover:bg-white/25"><Facebook className="w-5 h-5" /></a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
