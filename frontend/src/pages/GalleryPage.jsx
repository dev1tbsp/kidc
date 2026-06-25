import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import useSEO from "@/lib/useSEO";
import SectionHeader from "@/components/SectionHeader";

export default function GalleryPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState("all");

  useSEO({
    title: "Gallery — Little Bash Parties in Action",
    description: "Real parties, real smiles. Browse photos of birthday parties hosted by Little Bash Co — themes, food, activities and more.",
  });

  useEffect(() => {
    api.get("/gallery").then((r) => setItems(r.data));
  }, []);

  const categories = ["all", ...Array.from(new Set(items.map((i) => i.category)))];
  const visible = filter === "all" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="py-16 sm:py-24" data-testid="gallery-page">
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <SectionHeader
          overline="Our Gallery"
          title="Browse the chaos. (The good kind.)"
          subtitle="Every photo tells a story. Click around — get inspired for your next party."
          align="center"
        />

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setFilter(c)}
              className={`px-5 py-2 rounded-full text-sm font-bold capitalize transition ${
                filter === c ? "bg-sky-500 text-white shadow-lg shadow-sky-500/30" : "bg-white text-slate-700 border-2 border-slate-200 hover:border-sky-300"
              }`}
              data-testid={`filter-${c}`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {visible.map((img, idx) => (
            <div key={img.id} className="break-inside-avoid rounded-3xl overflow-hidden bouncy" data-testid={`gallery-item-${idx}`}>
              <img src={img.url} alt={img.caption || "Party"} className="w-full h-auto" />
              {img.caption && (
                <div className="p-4 bg-white">
                  <p className="font-heading font-bold text-slate-900">{img.caption}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
