import { Link, NavLink } from "react-router-dom";
import { useState } from "react";
import { Menu, X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

const links = [
  { to: "/", label: "Home" },
  { to: "/packages", label: "Packages" },
  { to: "/gallery", label: "Gallery" },
  { to: "/contact", label: "Contact" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/60" data-testid="site-navbar">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group" data-testid="nav-logo">
          <span className="w-10 h-10 rounded-2xl bg-sky-500 text-white grid place-items-center shadow-lg shadow-sky-500/30 group-hover:rotate-6 transition">
            <PartyPopper className="w-5 h-5" />
          </span>
          <span className="font-heading text-2xl font-bold text-slate-900">Little Bash Co</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.label.toLowerCase()}`}
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition ${
                  isActive
                    ? "bg-sky-100 text-sky-700"
                    : "text-slate-700 hover:bg-slate-100"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/quote" className="hidden sm:block" data-testid="nav-quote-button">
            <Button className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-6 py-5 shadow-lg shadow-amber-400/30 hover:-translate-y-0.5 transition">
              Get a Quote
            </Button>
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden w-11 h-11 rounded-full bg-slate-100 grid place-items-center"
            data-testid="nav-mobile-toggle"
            aria-label="Toggle menu"
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200/60 bg-white">
          <div className="px-5 py-4 flex flex-col gap-1">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                data-testid={`nav-mobile-link-${l.label.toLowerCase()}`}
                className={({ isActive }) =>
                  `px-4 py-3 rounded-2xl text-base font-semibold ${
                    isActive ? "bg-sky-100 text-sky-700" : "text-slate-700"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
            <Link to="/quote" onClick={() => setOpen(false)} data-testid="nav-mobile-quote">
              <Button className="w-full mt-2 rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold py-5">
                Get a Quote
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
