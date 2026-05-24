import { Link } from "react-router-dom";
import SectionHeader from "@/components/SectionHeader";
import { ArrowUpRight } from "lucide-react";

export default function GalleryPreviewSection({ items = [] }) {
  const top = items.slice(0, 6);
  return (
    <section className="py-20 sm:py-28 bg-slate-900 text-white relative overflow-hidden" data-testid="gallery-preview-section">
      <div className="absolute top-1/3 -right-32 w-96 h-96 bg-sky-500/30 blob" />
      <div className="absolute bottom-0 -left-32 w-96 h-96 bg-amber-400/20 blob" />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-amber-400 mb-3">
              Real Parties
            </p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              The vibe is loud. The smiles are louder.
            </h2>
          </div>
          <Link to="/gallery" className="text-amber-400 font-bold inline-flex items-center gap-2 group" data-testid="gallery-view-all">
            <span>View full gallery</span>
            <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {top.map((img, idx) => (
            <div
              key={img.id}
              className={`relative overflow-hidden rounded-3xl group ${
                idx === 0 ? "col-span-2 row-span-2 aspect-square md:aspect-auto md:h-full" : "aspect-square"
              }`}
              data-testid={`gallery-preview-${idx}`}
            >
              <img
                src={img.url}
                alt={img.caption || "Party"}
                className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent opacity-0 group-hover:opacity-100 transition" />
              {img.caption && (
                <div className="absolute bottom-4 left-4 text-white font-bold opacity-0 group-hover:opacity-100 transition">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
