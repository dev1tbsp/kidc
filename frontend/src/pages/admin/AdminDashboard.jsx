import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogOut, PartyPopper, ExternalLink } from "lucide-react";
import QuotesAdmin from "@/pages/admin/sections/QuotesAdmin";
import CrudAdmin from "@/pages/admin/sections/CrudAdmin";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [counts, setCounts] = useState({});

  useEffect(() => {
    (async () => {
      const [q, p, t, g] = await Promise.all([
        api.get("/admin/quotes"),
        api.get("/packages"),
        api.get("/testimonials"),
        api.get("/gallery"),
      ]);
      setCounts({ quotes: q.data.length, packages: p.data.length, testimonials: t.data.length, gallery: g.data.length });
    })();
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-50" data-testid="admin-dashboard">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-sky-500 text-white grid place-items-center"><PartyPopper className="w-5 h-5" /></span>
            <div>
              <p className="font-heading text-xl font-bold leading-tight">Kids Feast Admin</p>
              <p className="text-xs text-slate-500">Signed in as {user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/" target="_blank" rel="noreferrer">
              <Button variant="outline" className="rounded-full" data-testid="view-site-btn"><ExternalLink className="w-4 h-4 mr-1" /> View site</Button>
            </Link>
            <Button onClick={handleLogout} className="rounded-full bg-slate-900 hover:bg-slate-800" data-testid="logout-btn">
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Quotes", value: counts.quotes ?? "—", color: "bg-sky-500" },
            { label: "Packages", value: counts.packages ?? "—", color: "bg-amber-500" },
            { label: "Testimonials", value: counts.testimonials ?? "—", color: "bg-pink-500" },
            { label: "Gallery", value: counts.gallery ?? "—", color: "bg-emerald-500" },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 shadow-sm" data-testid={`stat-${s.label.toLowerCase()}`}>
              <div className={`w-2 h-8 ${s.color} rounded-full mb-3`}></div>
              <p className="font-heading text-3xl font-black text-slate-900">{s.value}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="quotes" className="w-full">
          <TabsList className="bg-white rounded-full p-1.5 h-auto flex-wrap justify-start gap-1 mb-6">
            {[
              ["quotes", "Quote Requests"],
              ["packages", "Packages"],
              ["age-groups", "Age Groups"],
              ["activities", "Activities"],
              ["snack-boxes", "Snack Boxes"],
              ["testimonials", "Testimonials"],
              ["gallery", "Gallery"],
            ].map(([v, label]) => (
              <TabsTrigger key={v} value={v} className="rounded-full px-5 py-2 data-[state=active]:bg-sky-500 data-[state=active]:text-white" data-testid={`tab-${v}`}>
                {label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="quotes"><QuotesAdmin /></TabsContent>
          <TabsContent value="packages"><CrudAdmin name="packages" title="Packages" fields={packageFields} /></TabsContent>
          <TabsContent value="age-groups"><CrudAdmin name="age-groups" title="Age Groups" fields={ageGroupFields} /></TabsContent>
          <TabsContent value="activities"><CrudAdmin name="activities" title="Activities" fields={activityFields} /></TabsContent>
          <TabsContent value="snack-boxes"><CrudAdmin name="snack-boxes" title="Snack Boxes" fields={snackBoxFields} /></TabsContent>
          <TabsContent value="testimonials"><CrudAdmin name="testimonials" title="Testimonials" fields={testimonialFields} /></TabsContent>
          <TabsContent value="gallery"><CrudAdmin name="gallery" title="Gallery" fields={galleryFields} /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

const packageFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "tagline", label: "Tagline", type: "text" },
  { key: "price_per_child", label: "Price per child (₹)", type: "number" },
  { key: "min_guests", label: "Minimum guests", type: "number" },
  { key: "features", label: "Features (comma-sep)", type: "list" },
  { key: "activities", label: "Activities (comma-sep)", type: "list" },
  { key: "color", label: "Color (sky/amber/pink)", type: "text" },
  { key: "popular", label: "Popular?", type: "bool" },
  { key: "order", label: "Order", type: "number" },
];

const ageGroupFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "age_range", label: "Age range", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "icon", label: "Icon name (Baby/Sparkles/Rocket/Trophy/Cake)", type: "text" },
  { key: "color", label: "Color (pink/amber/sky/emerald)", type: "text" },
  { key: "order", label: "Order", type: "number" },
];

const activityFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "icon", label: "Icon (Wand2/PartyPopper/Palette/Map/FlaskConical/Camera)", type: "text" },
  { key: "order", label: "Order", type: "number" },
];

const snackBoxFields = [
  { key: "name", label: "Name", type: "text" },
  { key: "description", label: "Description", type: "textarea" },
  { key: "price", label: "Price (₹)", type: "number" },
  { key: "items", label: "Items (comma-sep)", type: "list" },
  { key: "image", label: "Image", type: "image" },
  { key: "order", label: "Order", type: "number" },
];

const testimonialFields = [
  { key: "parent_name", label: "Parent name", type: "text" },
  { key: "child_name", label: "Child name", type: "text" },
  { key: "rating", label: "Rating (1-5)", type: "number" },
  { key: "message", label: "Message", type: "textarea" },
  { key: "event_type", label: "Event type", type: "text" },
  { key: "order", label: "Order", type: "number" },
];

const galleryFields = [
  { key: "url", label: "Image", type: "image" },
  { key: "caption", label: "Caption", type: "text" },
  { key: "category", label: "Category (party/cake/food/activity/people)", type: "text" },
  { key: "order", label: "Order", type: "number" },
];
