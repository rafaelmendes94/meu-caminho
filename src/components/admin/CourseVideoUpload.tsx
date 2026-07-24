import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX_MB = 500;
const BUCKET = "content-video";
const YEAR_SECONDS = 31_536_000;

export function CourseVideoUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`Vídeo excede ${MAX_MB}MB.`);
      return;
    }
    setBusy(true);
    try {
      const ext = file.name.split(".").pop()?.toLowerCase() ?? "mp4";
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: file.type || "video/mp4",
      });
      if (error) throw error;
      const { data, error: signErr } = await supabase.storage.from(BUCKET).createSignedUrl(path, YEAR_SECONDS);
      if (signErr) throw signErr;
      onChange(data.signedUrl);
      toast.success("Vídeo enviado.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4">
      <p className="text-sm font-semibold text-[#0F172A]">Vídeo principal do curso</p>
      <p className="text-xs text-[#64748B] mb-3">
        Cole a URL do player (VTurb/converteai, YouTube ou Vimeo) ou envie um arquivo (máx {MAX_MB}MB, bucket privado <code>{BUCKET}</code>).
      </p>
      <div className="flex gap-2">
        <input
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
          placeholder="https://scripts.converteai.net/…/player.js  ou  URL do YouTube/Vimeo"
          className="flex-1 min-w-0 px-3 py-2 bg-white border border-[#E2E8F0] rounded-lg text-[#0F172A] text-sm"
        />
        <input
          ref={inputRef}
          type="file"
          accept="video/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void upload(f);
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="px-3 py-2 bg-white border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold rounded-lg disabled:opacity-50 whitespace-nowrap"
        >
          {busy ? "Enviando…" : "Upload"}
        </button>
      </div>
    </div>
  );
}