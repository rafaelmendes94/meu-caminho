import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type Bucket = "content-audio" | "content-video" | "content-pdf" | "content-images";

const MAX_MB: Record<Bucket, number> = {
  "content-audio": 100,
  "content-video": 500,
  "content-pdf": 50,
  "content-images": 10,
};

const ACCEPT: Record<Bucket, string> = {
  "content-audio": "audio/*",
  "content-video": "video/*",
  "content-pdf": "application/pdf,.epub",
  "content-images": "image/*",
};

const YEAR_SECONDS = 31_536_000;

export function StorageUpload({
  bucket,
  value,
  onChange,
  label,
}: {
  bucket: Bucket;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (file: File) => {
    const maxBytes = MAX_MB[bucket] * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`Arquivo excede ${MAX_MB[bucket]}MB.`);
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || undefined,
      });
      if (upErr) throw upErr;
      const { data, error: signErr } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, YEAR_SECONDS);
      if (signErr) throw signErr;
      onChange(data.signedUrl);
      toast.success("Upload concluído.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="block">
      <span className="text-xs text-white/50">{label}</span>
      <div className="mt-1 flex gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="URL ou envie um arquivo"
          className="flex-1 min-w-0 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm"
        />
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT[bucket]}
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handleFile(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs rounded-lg disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? "Enviando…" : "Upload"}
        </button>
      </div>
      <p className="mt-1 text-[10px] text-white/30">
        Bucket: {bucket} · máx {MAX_MB[bucket]}MB · URL assinada válida 1 ano
      </p>
    </div>
  );
}