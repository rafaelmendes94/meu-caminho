import { useRef, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const MAX_MB = 100;

export type BookFileMeta = {
  original_file_bucket?: string;
  original_file_path?: string;
  original_file_name?: string;
  original_file_size?: number;
};

export function BookPdfUpload({
  value,
  onChange,
}: {
  value: BookFileMeta;
  onChange: (v: BookFileMeta) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const upload = async (file: File) => {
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`PDF excede ${MAX_MB}MB.`);
      return;
    }
    if (file.type && file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast.error("Envie um arquivo PDF.");
      return;
    }
    setBusy(true);
    try {
      const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.pdf`;
      const { error } = await supabase.storage.from("content-books").upload(path, file, {
        cacheControl: "31536000",
        upsert: false,
        contentType: "application/pdf",
      });
      if (error) throw error;
      onChange({
        original_file_bucket: "content-books",
        original_file_path: path,
        original_file_name: file.name,
        original_file_size: file.size,
      });
      toast.success("PDF enviado. Agora processe com IA.");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no upload.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-[#CBD5E1] bg-[#F8FAFC] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#0F172A]">PDF do livro</p>
          <p className="text-xs text-[#64748B] truncate">
            {value?.original_file_name
              ? `${value.original_file_name} · ${((value.original_file_size ?? 0) / 1024 / 1024).toFixed(1)} MB`
              : `Envie um PDF (máx ${MAX_MB}MB) — bucket privado content-books.`}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          {value?.original_file_path && (
            <button
              type="button"
              onClick={() => onChange({})}
              className="px-3 py-2 text-xs text-[#64748B] hover:text-[#0F172A]"
            >
              Remover
            </button>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
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
            className="px-3 py-2 bg-[#F88A2B] text-black text-xs font-bold rounded-lg disabled:opacity-50"
          >
            {busy ? "Enviando…" : value?.original_file_path ? "Substituir PDF" : "Selecionar PDF"}
          </button>
        </div>
      </div>
    </div>
  );
}