import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import useSEO from "@/lib/useSEO";
import HeroSection from "@/pages/sections/HeroSection";
import AgeGroupsSection from "@/pages/sections/AgeGroupsSection";
import ActivitiesSection from "@/pages/sections/ActivitiesSection";
import PackagesSection from "@/pages/sections/PackagesSection";
import SnackBoxesSection from "@/pages/sections/SnackBoxesSection";
import GalleryPreviewSection from "@/pages/sections/GalleryPreviewSection";
import TestimonialsSection from "@/pages/sections/TestimonialsSection";
import CtaSection from "@/pages/sections/CtaSection";

export default function Home() {
  const [data, setData] = useState({
    ageGroups: [], activities: [], packages: [], snackBoxes: [], testimonials: [], gallery: [],
  });

  useSEO({
    title: "Little Bash Co — Birthday Party Catering & Activities for Kids",
    description: "Stress-free kids birthday parties: themed catering, hands-on activities, snack boxes & instant quotes. By age group. Book the magic today.",
    image: "https://images.unsplash.com/photo-1530104091755-015d31dfa0b9?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjh8MHwxfHNlYXJjaHwzfHxraWRzJTIwYmlydGhkYXklMjBwYXJ0eSUyMHBsYXlpbmclMjBiYWxsb29uc3xlbnwwfHx8fDE3Nzk2MTQ3MTl8MA&ixlib=rb-4.1.0&q=85",
  });

  useEffect(() => {
    (async () => {
      try {
        const [a, b, c, d, e, f] = await Promise.all([
          api.get("/age-groups"),
          api.get("/activities"),
          api.get("/packages"),
          api.get("/snack-boxes"),
          api.get("/testimonials"),
          api.get("/gallery"),
        ]);
        setData({
          ageGroups: a.data,
          activities: b.data,
          packages: c.data,
          snackBoxes: d.data,
          testimonials: e.data,
          gallery: f.data,
        });
      } catch (err) {
        console.error("Failed to load content", err);
      }
    })();
  }, []);

  return (
    <div data-testid="home-page">
      <HeroSection />
      <AgeGroupsSection items={data.ageGroups} />
      <ActivitiesSection items={data.activities} />
      <PackagesSection items={data.packages} />
      <SnackBoxesSection items={data.snackBoxes} />
      <GalleryPreviewSection items={data.gallery} />
      <TestimonialsSection items={data.testimonials} />
      <CtaSection />
    </div>
  );
}
