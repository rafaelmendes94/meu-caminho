import { useMemo, useState } from "react";
import VTurbPlayer, { parseVTurbSource } from "@/components/VTurbPlayer";

// Regex-espelho do parseVTurbSource, só pra rotular no admin.
const VTURB_RE = /scripts\.converteai\.net\/([^/]+)\/players\/([^/]+)\/player\.js/i;

function analyze(url: string): { valid: boolean; account?: string; player?: string; message: string } {
  const raw = (url ?? "").trim();
  if (!raw) return { valid: false, message: "Cole a URL completa do script VTurb (ConverteAI)." };
  const m = raw.match(VTURB_RE);
  if (!m) {
    return {
      valid: false,
      message: "URL inválida. Formato esperado: https://scripts.converteai.net/<conta>/players/<id>/player.js",
    };
  }
  return { valid: true, account: m[1], player: m[2], message: "URL VTurb válida." };
}

export function CourseVideoUpload({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
}) {
  const [showPreview, setShowPreview] = useState(false);
  const info = useMemo(() => analyze(value ?? ""), [value]);
  const parsed = useMemo(() => parseVTurbSource(value ?? "") as any, [value]);

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-4">
      <div className="flex items-center justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-semibold text-[#0F172A]">Vídeo principal do curso · VTurb</p>
          <p className="text-xs text-[#64748B]">Player oficial da plataforma. Cole a URL completa do script gerado no painel VTurb (ConverteAI).</p>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[#0F172A] text-white uppercase tracking-wider">VTurb</span>
      </div>

      <label className="block">
        <span className="text-[11px] font-semibold text-[#0F172A]">URL do script</span>
        <input
          value={value ?? ""}
          onChange={(e) => { onChange(e.target.value || null); setShowPreview(false); }}
          placeholder="https://scripts.converteai.net/<conta>/players/<id>/player.js"
          className={`w-full mt-1 px-3 py-2 bg-[#F8FAFC] border rounded-lg text-[#0F172A] text-sm font-mono ${value && !info.valid ? "border-red-400" : "border-[#E2E8F0]"}`}
        />
      </label>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className={`text-[11px] ${!value ? "text-[#64748B]" : info.valid ? "text-emerald-700" : "text-red-600"}`}>
          {info.message}
        </p>
        <button
          type="button"
          disabled={!info.valid}
          onClick={() => setShowPreview((v) => !v)}
          className="px-3 py-1.5 bg-[#F88A2B] text-black text-[11px] font-bold rounded-lg disabled:opacity-40"
        >
          {showPreview ? "Ocultar preview" : "Testar player"}
        </button>
      </div>

      {info.valid && (
        <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-[#334155]">
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1">
            <span className="text-[#64748B]">Account ID</span>
            <p className="font-mono truncate">{info.account}</p>
          </div>
          <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded px-2 py-1">
            <span className="text-[#64748B]">Player ID</span>
            <p className="font-mono truncate">{info.player}</p>
          </div>
        </div>
      )}

      {showPreview && parsed?.playerId && (
        <div className="mt-3 rounded-lg overflow-hidden border border-[#E2E8F0]">
          <VTurbPlayer source={value!} className="w-full" />
        </div>
      )}

      <p className="mt-3 text-[10.5px] text-[#94A3B8]">
        Onde encontrar: painel VTurb → <b>Players</b> → botão <b>Embed</b> → copie a linha que contém <code>scripts.converteai.net/…/player.js</code>.
      </p>
    </div>
  );
}