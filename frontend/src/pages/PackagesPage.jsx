import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import useSEO from "@/lib/useSEO";
import PackagesSection from "@/pages/sections/PackagesSection";
import SnackBoxesSection from "@/pages/sections/SnackBoxesSection";
import CtaSection from "@/pages/sections/CtaSection";

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [snackBoxes, setSnackBoxes] = useState([]);

  useSEO({
    title: "Packages & Pricing — Little Bash Catering",
    description: "Compare our Mini Bash, Super Party and Mega Blast packages. Themed décor, food, activities and dedicated hosts included.",
  });

  useEffect(() => {
    (async () => {
      const [p, s] = await Promise.all([api.get("/packages"), api.get("/snack-boxes")]);
      setPackages(p.data);
      setSnackBoxes(s.data);
    })();
  }, []);

  return (
    <div data-testid="packages-page">
      <div className="pt-16 pb-2 max-w-7xl mx-auto px-5 sm:px-8 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-500 mb-3">Packages</p>
        <h1 className="font-heading text-5xl sm:text-6xl font-black text-slate-900 leading-tight">
          Pick a vibe. We handle the rest.
        </h1>
      </div>
      <PackagesSection items={packages} />
      <SnackBoxesSection items={snackBoxes} />
      <CtaSection />
    </div>
  );
}
