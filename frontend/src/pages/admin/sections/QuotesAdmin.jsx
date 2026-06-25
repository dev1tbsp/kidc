import { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Trash2, Mail, Phone, Calendar } from "lucide-react";

const STATUSES = ["new", "contacted", "booked", "completed", "cancelled"];

export default function QuotesAdmin() {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get("/admin/quotes");
      setQuotes(data);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/admin/quotes/${id}`, { status });
      setQuotes((qs) => qs.map((q) => q.id === id ? { ...q, status } : q));
      toast.success("Status updated");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this quote?")) return;
    try {
      await api.delete(`/admin/quotes/${id}`);
      setQuotes((qs) => qs.filter((q) => q.id !== id));
      toast.success("Deleted");
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  if (loading) return <div className="text-slate-500">Loading quotes...</div>;
  if (quotes.length === 0) return <div className="bg-white rounded-3xl p-10 text-center text-slate-500">No quote requests yet.</div>;

  return (
    <div className="space-y-4" data-testid="quotes-admin">
      {quotes.map((q) => (
        <div key={q.id} className="bg-white rounded-3xl p-6 shadow-sm" data-testid={`quote-row-${q.id}`}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-heading text-xl font-bold">{q.parent_name}</h3>
                <Badge className={`${q.status === "new" ? "bg-sky-500" : q.status === "booked" ? "bg-emerald-500" : q.status === "completed" ? "bg-slate-500" : q.status === "cancelled" ? "bg-red-500" : "bg-amber-500"} text-white`}>
                  {q.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-slate-600">
                <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {q.email}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {q.phone}</span>
                {q.event_date && <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {q.event_date}</span>}
              </div>
            </div>
            <div className="text-right">
              <p className="font-heading text-2xl font-black text-sky-600">₹{q.estimated_total}</p>
              <p className="text-xs text-slate-500">{q.guest_count} kids · {q.package_name || "no pkg"}</p>
            </div>
          </div>

          {q.notes && <p className="mt-3 text-sm text-slate-700 bg-slate-50 rounded-2xl p-3">{q.notes}</p>}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-1.5 flex-wrap">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => updateStatus(q.id, s)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-full capitalize ${q.status === s ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                  data-testid={`status-btn-${s}`}
                >{s}</button>
              ))}
            </div>
            <Button onClick={() => remove(q.id)} variant="ghost" size="sm" className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-full" data-testid="quote-delete-btn">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
