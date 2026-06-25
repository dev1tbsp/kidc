import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail, Phone, MapPin, PartyPopper } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-white mt-32 overflow-hidden" data-testid="site-footer">
      <div className="absolute -top-32 -left-20 w-96 h-96 bg-sky-500/20 blob" />
      <div className="absolute -bottom-32 -right-20 w-[28rem] h-[28rem] bg-amber-400/15 blob" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-16">
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-900 grid place-items-center">
                <PartyPopper className="w-6 h-6" />
              </span>
              <span className="font-heading text-3xl font-bold">Little Bash Co</span>
            </div>
            <p className="text-slate-300 max-w-md leading-relaxed">
              We craft unforgettable birthday parties for kids of every age — vibrant catering, hands-on activities and stress-free planning, end to end.
            </p>
            <div className="flex gap-3 mt-6">
              <a href="https://instagram.com/LittleBashCo.in" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white/10 hover:bg-pink-400 hover:text-slate-900 grid place-items-center transition" data-testid="footer-instagram">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="https://facebook.com/LittleBashCo" target="_blank" rel="noreferrer" className="w-11 h-11 rounded-full bg-white/10 hover:bg-sky-400 hover:text-slate-900 grid place-items-center transition" data-testid="footer-facebook">
                <Facebook className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-heading text-lg font-bold mb-4">Explore</h4>
            <ul className="space-y-2 text-slate-300">
              <li><Link to="/" className="hover:text-amber-400">Home</Link></li>
              <li><Link to="/packages" className="hover:text-amber-400">Packages</Link></li>
              <li><Link to="/gallery" className="hover:text-amber-400">Gallery</Link></li>
              <li><Link to="/quote" className="hover:text-amber-400">Get a Quote</Link></li>
              <li><Link to="/contact" className="hover:text-amber-400">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading text-lg font-bold mb-4">Reach Us</h4>
            <ul className="space-y-3 text-slate-300 text-sm">
              <li className="flex gap-2 items-start"><Phone className="w-4 h-4 mt-0.5 text-amber-400" /> +91 (8929) 112 775</li>
              <li className="flex gap-2 items-start"><Mail className="w-4 h-4 mt-0.5 text-amber-400" /> hello@littlebashco.in</li>
              <li className="flex gap-2 items-start"><MapPin className="w-4 h-4 mt-0.5 text-amber-400" /> H 39, Sector 70, Noida</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} Little Bash Co. All rights reserved.</p>
          <Link to="/admin/login" className="text-slate-500 hover:text-slate-300 text-xs" data-testid="footer-admin-link">
            Staff Login
          </Link>
        </div>
      </div>

      <div className="relative">
        <h2 className="font-heading text-[18vw] md:text-[14vw] font-black text-white/[0.04] leading-none text-center select-none">
          LITTLE BASH CO
        </h2>
      </div>
    </footer>
  );
}
