import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, RefreshCw, FileAudio } from "lucide-react";

const MAX_SIZE = 50 * 1024 * 1024;
const ACCEPT = ".mp3,.m4a,.wav,.aac,.ogg,audio/mpeg,audio/mp4,audio/wav,audio/aac,audio/ogg";

export type AudioUploadResult = {
  public_url: string;
  object_key: string;
  bucket: string;
  file_size: number;
  mime_type: string;
  original_file_name: string;
  uploaded_at: string;
};

function fmtSize(bytes?: number | null) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function AudioR2Upload({
  audioId,
  audioKind,
  value,
  meta,
  onUploaded,
  onRemoved,
}: {
  audioId?: string | null;
  audioKind?: string;
  value?: string | null;
  meta?: Partial<AudioUploadResult> | null;
  onUploaded: (r: AudioUploadResult) => void;
  onRemoved?: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(value ?? null);

  useEffect(() => { setPreviewUrl(value ?? null); }, [value]);

  const doUpload = async (file: File) => {
    if (file.size > MAX_SIZE) {
      toast.error(`Arquivo excede ${MAX_SIZE / (1024 * 1024)}MB.`);
      return;
    }
    setUploading(true); setProgress(5);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const token = sess?.session?.access_token;
      if (!token) throw new Error("Sessão expirada. Faça login novamente.");
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-audio-r2`;
      const fd = new FormData();
      fd.append("file", file);
      if (audioId) fd.append("audio_id", audioId);
      if (audioKind) fd.append("audio_kind", audioKind);
      // Use XHR to report progress
      const result: AudioUploadResult = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url);
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.max(5, Math.round((e.loaded / e.total) * 95)));
        };
        xhr.onerror = () => reject(new Error("Falha de rede."));
        xhr.onload = () => {
          try {
            const body = JSON.parse(xhr.responseText || "{}");
            if (xhr.status >= 200 && xhr.status < 300 && body?.success) resolve(body);
            else reject(new Error(body?.error || `HTTP ${xhr.status}`));
          } catch (e) { reject(e as Error); }
        };
        xhr.send(fd);
      });
      setProgress(100);
      setPreviewUrl(result.public_url);
      onUploaded(result);
      toast.success("Áudio enviado para o R2.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no upload.");
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  };

  const remove = async () => {
    if (!meta?.object_key) { setPreviewUrl(null); onRemoved?.(); return; }
    if (!confirm("Remover áudio do R2? A ação é permanente.")) return;
    try {
      const { data, error } = await supabase.functions.invoke("delete-audio-r2", {
        body: { object_key: meta.object_key, audio_id: audioId, clear_from_content: true },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      setPreviewUrl(null);
      onRemoved?.();
      toast.success("Áudio removido do R2.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao remover.");
    }
  };

  return (
    <div className="w-full">
      <label className="text-xs text-[#64748B] mb-1 block">Arquivo de áudio (Cloudflare R2)</label>
      <input ref={inputRef} type="file" accept={ACCEPT} className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void doUpload(f); e.target.value = ""; }} />

      {!previewUrl && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void doUpload(f); }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-colors ${dragOver ? "border-[#F88A2B] bg-[#F88A2B]/5" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#94A3B8]"}`}
        >
          <Upload className="w-6 h-6 mx-auto text-[#64748B]" />
          <p className="text-sm text-[#0F172A] font-semibold mt-2">Clique ou arraste um arquivo</p>
          <p className="text-[11px] text-[#64748B] mt-1">mp3, m4a, wav, aac, ogg · até 50MB · recomendado 96–128 kbps</p>
        </div>
      )}

      {previewUrl && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-3">
          <div className="flex items-center gap-3">
            <FileAudio className="w-5 h-5 text-[#F88A2B] shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[#0F172A] truncate">{meta?.original_file_name ?? "Áudio publicado"}</p>
              <p className="text-[11px] text-[#64748B] truncate">
                {meta?.mime_type ?? "audio"} · {fmtSize(meta?.file_size ?? 0)} · R2
              </p>
              {meta?.object_key && <p className="text-[10px] text-[#94A3B8] truncate font-mono">{meta.object_key}</p>}
            </div>
            <button type="button" onClick={() => inputRef.current?.click()} className="flex items-center gap-1 px-2 py-1 rounded-md border border-[#E2E8F0] text-[11px] text-[#334155] hover:bg-[#F8FAFC]">
              <RefreshCw className="w-3 h-3" /> Substituir
            </button>
            <button type="button" onClick={remove} className="flex items-center gap-1 px-2 py-1 rounded-md border border-red-200 text-red-600 text-[11px] hover:bg-red-50">
              <X className="w-3 h-3" /> Remover
            </button>
          </div>
          <audio controls src={previewUrl} className="w-full mt-3" preload="metadata" />
        </div>
      )}

      {uploading && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div className="h-full bg-[#F88A2B] transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-[11px] text-[#64748B] mt-1">Enviando… {progress}%</p>
        </div>
      )}
    </div>
  );
}