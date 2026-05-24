import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { api, formatApiErrorDetail } from "@/lib/api";
import useSEO from "@/lib/useSEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Baby, Sparkles, Rocket, Trophy, Cake,
  Wand2, PartyPopper, Palette, Map, FlaskConical, Camera,
  ChevronLeft, ChevronRight, Check, Send
} from "lucide-react";

const ICONS = { Baby, Sparkles, Rocket, Trophy, Cake, Wand2, PartyPopper, Palette, Map, FlaskConical, Camera };

const STEPS = ["Age Group", "Guests", "Package", "Activities", "Snack Box", "Your Details"];

export default function QuotePage() {
  const location = useLocation();
  const initialPackageId = location.state?.packageId || null;

  useSEO({
    title: "Build Your Quote — Kids Feast Catering",
    description: "Get an instant, transparent quote for your child's birthday party. Pick age, package, activities & snack boxes.",
  });

  const [step, setStep] = useState(0);
  const [data, setData] = useState({ ageGroups: [], packages: [], activities: [], snackBoxes: [] });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);

  const [form, setForm] = useState({
    age_group_id: null,
    guest_count: 15,
    package_id: initialPackageId,
    activity_ids: [],
    snack_box_id: null,
    add_on_snack_count: 0,
    parent_name: "",
    email: "",
    phone: "",
    event_date: "",
    notes: "",
  });

  useEffect(() => {
    (async () => {
      const [a, b, c, d] = await Promise.all([
        api.get("/age-groups"),
        api.get("/packages"),
        api.get("/activities"),
        api.get("/snack-boxes"),
      ]);
      setData({ ageGroups: a.data, packages: b.data, activities: c.data, snackBoxes: d.data });
    })();
  }, []);

  const selectedPackage = data.packages.find((p) => p.id === form.package_id);
  const selectedAgeGroup = data.ageGroups.find((a) => a.id === form.age_group_id);
  const selectedSnackBox = data.snackBoxes.find((s) => s.id === form.snack_box_id);

  const estimate = useMemo(() => {
    let total = 0;
    if (selectedPackage) total += selectedPackage.price_per_child * form.guest_count;
    if (selectedSnackBox && form.add_on_snack_count > 0) {
      total += selectedSnackBox.price * form.add_on_snack_count;
    }
    return Math.round(total);
  }, [selectedPackage, selectedSnackBox, form.guest_count, form.add_on_snack_count]);

  const canNext = () => {
    if (step === 0) return !!form.age_group_id;
    if (step === 1) return form.guest_count >= 5;
    if (step === 2) return !!form.package_id;
    if (step === 3) return true;
    if (step === 4) return true;
    return true;
  };

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const submit = async () => {
    if (!form.parent_name || !form.email || !form.phone) {
      toast.error("Please complete name, email and phone.");
      return;
    }
    setSubmitting(true);
    try {
      const { data: res } = await api.post("/quotes", {
        ...form,
        age_group_name: selectedAgeGroup?.name,
        package_name: selectedPackage?.name,
        snack_box_name: selectedSnackBox?.name,
        estimated_total: estimate,
      });
      setSubmitted({ ...res, estimate });
      toast.success("Your quote was submitted! We'll be in touch shortly.");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail) || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-8 py-24 text-center" data-testid="quote-success">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-emerald-100 grid place-items-center mb-6">
          <Check className="w-10 h-10 text-emerald-600" />
        </div>
        <h1 className="font-heading text-4xl sm:text-5xl font-black text-slate-900 mb-4">
          You're booked into our queue!
        </h1>
        <p className="text-lg text-slate-700 mb-6">
          Your estimated total is <span className="font-heading font-black text-sky-600 text-2xl">${submitted.estimate}</span>. We'll reach out within 24 hours to lock in the details.
        </p>
        <a href="/" className="inline-block">
          <Button className="rounded-full bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 font-bold">Back to home</Button>
        </a>
      </div>
    );
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="relative py-12 sm:py-20" data-testid="quote-page">
      <div className="absolute -top-20 -left-32 w-96 h-96 bg-sky-200 blob" />
      <div className="absolute -top-10 -right-20 w-80 h-80 bg-amber-200 blob" />

      <div className="relative max-w-5xl mx-auto px-5 sm:px-8">
        <div className="text-center mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky-500 mb-3">Step {step + 1} of {STEPS.length}</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-black text-slate-900">{STEPS[step]}</h1>
        </div>

        <Progress value={progress} className="mb-10 h-2 bg-slate-200" data-testid="quote-progress" />

        <div className="bg-white rounded-[2rem] shadow-xl shadow-sky-500/5 ring-1 ring-slate-100 p-6 sm:p-10">
          {step === 0 && (
            <div className="grid sm:grid-cols-2 gap-4" data-testid="step-age-group">
              {data.ageGroups.map((g) => {
                const Icon = ICONS[g.icon] || Cake;
                const active = form.age_group_id === g.id;
                return (
                  <button
                    key={g.id}
                    onClick={() => setForm({ ...form, age_group_id: g.id })}
                    className={`text-left p-6 rounded-3xl border-2 transition ${
                      active ? "border-sky-500 bg-sky-50 ring-4 ring-sky-200" : "border-slate-200 bg-white hover:border-sky-300"
                    }`}
                    data-testid={`age-option-${g.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    <div className={`w-12 h-12 rounded-2xl grid place-items-center mb-3 ${active ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-600"}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="text-xs font-black uppercase tracking-wider text-sky-500">{g.age_range}</p>
                    <h3 className="font-heading text-xl font-bold mt-1">{g.name}</h3>
                    <p className="text-sm text-slate-600 mt-1">{g.description}</p>
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="text-center" data-testid="step-guests">
              <p className="text-slate-600 mb-8">Roughly how many kids are coming?</p>
              <div className="font-heading text-7xl font-black text-sky-600 mb-6" data-testid="guest-count-display">{form.guest_count}</div>
              <input
                type="range" min="5" max="60" value={form.guest_count}
                onChange={(e) => setForm({ ...form, guest_count: parseInt(e.target.value) })}
                className="w-full max-w-md accent-sky-500"
                data-testid="guest-count-slider"
              />
              <div className="flex justify-between max-w-md mx-auto text-xs text-slate-500 font-bold mt-2">
                <span>5 kids</span><span>60 kids</span>
              </div>
              <div className="mt-6 inline-flex gap-2">
                {[10, 15, 20, 30].map(n => (
                  <button
                    key={n}
                    onClick={() => setForm({ ...form, guest_count: n })}
                    className={`px-4 py-2 rounded-full font-bold text-sm ${form.guest_count === n ? "bg-sky-500 text-white" : "bg-slate-100 text-slate-700"}`}
                  >{n}</button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="grid md:grid-cols-3 gap-4" data-testid="step-package">
              {data.packages.map((p) => {
                const active = form.package_id === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => setForm({ ...form, package_id: p.id })}
                    className={`text-left p-6 rounded-3xl border-2 transition ${
                      active ? "border-amber-400 bg-amber-50 ring-4 ring-amber-200" : "border-slate-200 hover:border-amber-300"
                    }`}
                    data-testid={`package-option-${p.name.toLowerCase().replace(/\s/g, "-")}`}
                  >
                    {p.popular && <span className="inline-block px-2 py-0.5 rounded-full bg-amber-400 text-slate-900 text-xs font-black uppercase mb-2">Popular</span>}
                    <h3 className="font-heading text-2xl font-bold">{p.name}</h3>
                    <p className="text-xs text-slate-500 font-bold mb-3">{p.tagline}</p>
                    <p className="font-heading text-3xl font-black text-slate-900">${p.price_per_child}<span className="text-sm font-bold text-slate-500">/child</span></p>
                    <ul className="mt-3 space-y-1">
                      {p.features.slice(0, 3).map((f, i) => (
                        <li key={i} className="text-xs text-slate-600 flex gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />{f}</li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>
          )}

          {step === 3 && (
            <div data-testid="step-activities">
              <p className="text-slate-600 mb-6 text-center">Toggle the activities you want included. Some may already be in your package.</p>
              <div className="grid sm:grid-cols-2 gap-3">
                {data.activities.map((a) => {
                  const Icon = ICONS[a.icon] || Sparkles;
                  const active = form.activity_ids.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setForm({
                          ...form,
                          activity_ids: active
                            ? form.activity_ids.filter((x) => x !== a.id)
                            : [...form.activity_ids, a.id],
                        });
                      }}
                      className={`text-left p-5 rounded-3xl border-2 transition flex items-center gap-4 ${
                        active ? "border-pink-400 bg-pink-50" : "border-slate-200 hover:border-pink-200"
                      }`}
                      data-testid={`activity-option-${a.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      <div className={`w-12 h-12 rounded-2xl grid place-items-center shrink-0 ${active ? "bg-pink-400 text-white" : "bg-slate-100 text-slate-600"}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <p className="font-heading font-bold">{a.name}</p>
                        <p className="text-xs text-slate-600">{a.description}</p>
                      </div>
                      {active && <Check className="w-5 h-5 text-pink-500" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {step === 4 && (
            <div data-testid="step-snacks">
              <p className="text-slate-600 mb-6 text-center">Want extra snack boxes? Pick a style and quantity.</p>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {data.snackBoxes.map((s) => {
                  const active = form.snack_box_id === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setForm({ ...form, snack_box_id: active ? null : s.id, add_on_snack_count: active ? 0 : form.add_on_snack_count })}
                      className={`text-left rounded-3xl border-2 overflow-hidden transition ${
                        active ? "border-emerald-400 ring-4 ring-emerald-200" : "border-slate-200 hover:border-emerald-300"
                      }`}
                      data-testid={`snack-option-${s.name.toLowerCase().replace(/\s/g, "-")}`}
                    >
                      {s.image && <img src={s.image} alt={s.name} className="w-full h-32 object-cover" />}
                      <div className="p-4">
                        <p className="font-heading font-bold">{s.name}</p>
                        <p className="text-xs text-slate-600 mt-1">{s.description}</p>
                        <p className="font-heading font-black text-emerald-600 mt-2">${s.price} <span className="text-xs text-slate-500 font-bold">/box</span></p>
                      </div>
                    </button>
                  );
                })}
              </div>
              {form.snack_box_id && (
                <div className="bg-emerald-50 rounded-3xl p-6 flex flex-wrap items-center gap-4 justify-between">
                  <div>
                    <p className="font-bold text-slate-900">How many extra boxes?</p>
                    <p className="text-xs text-slate-600">These add on top of your package.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setForm({ ...form, add_on_snack_count: Math.max(0, form.add_on_snack_count - 1) })}
                      className="w-10 h-10 rounded-full bg-white border-2 border-emerald-300 font-bold text-xl" data-testid="snack-minus">-</button>
                    <span className="font-heading text-3xl font-black w-12 text-center" data-testid="snack-count">{form.add_on_snack_count}</span>
                    <button onClick={() => setForm({ ...form, add_on_snack_count: form.add_on_snack_count + 1 })}
                      className="w-10 h-10 rounded-full bg-emerald-500 text-white font-bold text-xl" data-testid="snack-plus">+</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="grid md:grid-cols-2 gap-5" data-testid="step-contact">
              <div className="space-y-1">
                <Label htmlFor="parent_name">Your name</Label>
                <Input id="parent_name" value={form.parent_name} onChange={(e) => setForm({ ...form, parent_name: e.target.value })} placeholder="Jane Doe" className="rounded-2xl py-6" data-testid="input-parent-name" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="jane@email.com" className="rounded-2xl py-6" data-testid="input-email" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+1 555 555 5555" className="rounded-2xl py-6" data-testid="input-phone" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="event_date">Preferred date</Label>
                <Input id="event_date" type="date" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="rounded-2xl py-6" data-testid="input-event-date" />
              </div>
              <div className="md:col-span-2 space-y-1">
                <Label htmlFor="notes">Anything special? (Optional)</Label>
                <Textarea id="notes" rows={4} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Themes, allergies, requests..." className="rounded-2xl" data-testid="input-notes" />
              </div>
            </div>
          )}

          {/* Estimate banner */}
          {estimate > 0 && (
            <div className="mt-8 rounded-3xl bg-gradient-to-r from-sky-500 to-sky-600 text-white p-6 flex flex-wrap items-center justify-between gap-4" data-testid="quote-estimate">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-100">Estimated total</p>
                <p className="font-heading text-4xl font-black" data-testid="quote-calculator-total">${estimate}</p>
              </div>
              <div className="text-sky-100 text-sm max-w-xs text-right">
                {form.guest_count} kids × {selectedPackage?.name || "(pick a package)"}{form.add_on_snack_count > 0 && ` + ${form.add_on_snack_count} extra boxes`}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between gap-3">
            <Button
              onClick={back}
              disabled={step === 0}
              variant="outline"
              className="rounded-full px-6 py-6 border-2 disabled:opacity-30"
              data-testid="quote-back-button"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button
                onClick={next}
                disabled={!canNext()}
                className="rounded-full bg-sky-500 hover:bg-sky-600 text-white px-8 py-6 font-bold disabled:opacity-40"
                data-testid="quote-next-button"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                onClick={submit}
                disabled={submitting}
                className="rounded-full bg-amber-400 hover:bg-amber-500 text-slate-900 px-8 py-6 font-black shadow-xl shadow-amber-500/30"
                data-testid="quote-submit-button"
              >
                <Send className="w-4 h-4 mr-2" /> {submitting ? "Sending..." : "Send my quote"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
