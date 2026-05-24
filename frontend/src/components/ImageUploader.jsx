import { useRef, useState } from "react";
import { api, formatApiErrorDetail } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Upload, Image as ImageIcon, X } from "lucide-react";

/**
 * Image input with two modes:
 *  - Paste a URL directly
 *  - Or upload a file (Cloudflare R2 via /api/admin/upload/image)
 * Returns the public URL via onChange.
 */
export default function ImageUploader({ value, onChange, label = "Image URL" }) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Max file size is 10MB");
      return;
    }
    const form = new FormData();
    form.append("file", file);
    setUploading(true);
    try {
      const { data } = await api.post("/admin/upload/image", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      onChange(data.url);
      toast.success("Image uploaded");
    } catch (err) {
      const status = err.response?.status;
      const msg = formatApiErrorDetail(err.response?.data?.detail) || err.message;
      if (status === 503) {
        toast.error("Storage not configured. Paste a URL instead, or set R2 credentials in backend .env.");
      } else {
        toast.error(msg);
      }
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2" data-testid="image-uploader">
      <div className="flex items-center gap-2">
        <Input
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://... or upload below"
          className="rounded-2xl py-6"
          data-testid="image-url-input"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="w-11 h-11 rounded-full bg-slate-100 hover:bg-slate-200 grid place-items-center shrink-0"
            data-testid="clear-image"
          >
            <X className="w-4 h-4 text-slate-600" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          className="hidden"
          data-testid="image-file-input"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="rounded-full"
          data-testid="image-upload-btn"
        >
          <Upload className="w-4 h-4 mr-1" />
          {uploading ? "Uploading..." : "Upload image"}
        </Button>
        <p className="text-xs text-slate-500">JPG, PNG, WEBP, GIF · max 10MB</p>
      </div>

      {value && (
        <div className="mt-2 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 max-h-48">
          <img src={value} alt="preview" className="w-full max-h-48 object-cover" onError={(e) => { e.target.style.display = "none"; }} />
        </div>
      )}
      {!value && (
        <div className="mt-2 rounded-2xl border-2 border-dashed border-slate-200 grid place-items-center h-32 text-slate-400">
          <div className="text-center">
            <ImageIcon className="w-7 h-7 mx-auto mb-1" />
            <p className="text-xs">No image yet</p>
          </div>
        </div>
      )}
    </div>
  );
}
