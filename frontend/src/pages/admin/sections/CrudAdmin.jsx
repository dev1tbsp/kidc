import { useEffect, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import ImageUploader from "@/components/ImageUploader";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, X } from "lucide-react";

function buildInitial(fields) {
  const init = {};
  fields.forEach((f) => {
    init[f.key] = f.type === "bool" ? false : f.type === "list" ? [] : f.type === "number" ? 0 : "";
  });
  return init;
}

export default function CrudAdmin({ name, title, fields }) {
  const publicEndpoint = `/${name}`;
  const adminEndpoint = `/admin/${name}`;
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(buildInitial(fields));
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await api.get(publicEndpoint);
      setItems(data);
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [name]);

  const openCreate = () => {
    setEditing(null);
    setForm(buildInitial(fields));
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({ ...buildInitial(fields), ...item });
    setShowForm(true);
  };

  const save = async () => {
    const payload = { ...form };
    fields.forEach((f) => {
      if (f.type === "number") payload[f.key] = Number(payload[f.key]) || 0;
      if (f.type === "list" && typeof payload[f.key] === "string") {
        payload[f.key] = payload[f.key].split(",").map((s) => s.trim()).filter(Boolean);
      }
    });
    try {
      if (editing) {
        await api.put(`${adminEndpoint}/${editing.id}`, payload);
        toast.success("Saved");
      } else {
        await api.post(adminEndpoint, payload);
        toast.success("Created");
      }
      setShowForm(false);
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this item?")) return;
    try {
      await api.delete(`${adminEndpoint}/${id}`);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(formatApiErrorDetail(err.response?.data?.detail));
    }
  };

  if (loading) return <div className="text-slate-500">Loading {title}...</div>;

  return (
    <div data-testid={`crud-${name}`}>
      <div className="flex justify-between items-center mb-5">
        <h2 className="font-heading text-2xl font-bold">{title}</h2>
        <Button onClick={openCreate} className="rounded-full bg-sky-500 hover:bg-sky-600" data-testid={`add-${name}-btn`}>
          <Plus className="w-4 h-4 mr-1" /> Add
        </Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <div key={item.id} className="bg-white rounded-3xl p-5 shadow-sm" data-testid={`${name}-item-${item.id}`}>
            <div className="flex items-start justify-between mb-2 gap-2">
              <h3 className="font-heading font-bold text-slate-900 line-clamp-1">
                {item.name || item.parent_name || item.caption || item.url?.slice(-20) || "Item"}
              </h3>
              <div className="flex gap-1">
                <button onClick={() => openEdit(item)} className="p-2 rounded-full hover:bg-slate-100" data-testid={`edit-${item.id}`}>
                  <Pencil className="w-4 h-4 text-slate-600" />
                </button>
                <button onClick={() => remove(item.id)} className="p-2 rounded-full hover:bg-red-50 text-red-600" data-testid={`delete-${item.id}`}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            {item.url && <img src={item.url} alt={item.caption || ""} className="w-full h-32 object-cover rounded-2xl mb-2" />}
            <p className="text-xs text-slate-600 line-clamp-2">{item.description || item.message || item.tagline || item.category || ""}</p>
            {item.price_per_child !== undefined && <p className="text-sm font-bold text-sky-600 mt-2">₹{item.price_per_child}/child</p>}
            {item.price !== undefined && item.price_per_child === undefined && <p className="text-sm font-bold text-sky-600 mt-2">₹{item.price}</p>}
          </div>
        ))}
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="crud-form-modal">
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between rounded-t-[2rem]">
              <h3 className="font-heading text-2xl font-bold">{editing ? "Edit" : "Add"} {title}</h3>
              <button onClick={() => setShowForm(false)} className="p-2 rounded-full hover:bg-slate-100" data-testid="form-close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <Label htmlFor={f.key}>{f.label}</Label>
                  {f.type === "textarea" ? (
                    <Textarea id={f.key} rows={3} value={form[f.key] || ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="rounded-2xl" />
                  ) : f.type === "bool" ? (
                    <div><Switch checked={!!form[f.key]} onCheckedChange={(v) => setForm({ ...form, [f.key]: v })} /></div>
                  ) : f.type === "list" ? (
                    <Input id={f.key} value={Array.isArray(form[f.key]) ? form[f.key].join(", ") : (form[f.key] || "")} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} placeholder="item1, item2, item3" className="rounded-2xl py-6" />
                  ) : f.type === "image" ? (
                    <ImageUploader value={form[f.key]} onChange={(v) => setForm({ ...form, [f.key]: v })} />
                  ) : (
                    <Input id={f.key} type={f.type === "number" ? "number" : "text"} value={form[f.key] ?? ""} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} className="rounded-2xl py-6" />
                  )}
                </div>
              ))}
            </div>
            <div className="sticky bottom-0 bg-white border-t border-slate-200 px-6 py-4 rounded-b-[2rem] flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)} className="rounded-full">Cancel</Button>
              <Button onClick={save} className="rounded-full bg-sky-500 hover:bg-sky-600" data-testid="form-save-btn">
                {editing ? "Save" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
