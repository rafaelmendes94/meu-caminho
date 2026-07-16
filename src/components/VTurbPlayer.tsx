import { useEffect, useMemo, useRef } from "react";

/**
 * VTurb (ConverteAI / Smart Player) embed.
 *
 * Aceita:
 *  - script URL completa: https://scripts.converteai.net/<account>/players/<playerId>/player.js
 *  - apenas o playerId (uuid) — precisa também de accountId
 *
 * Recomendado: cole a URL completa do script fornecida pelo painel VTurb no campo
 * "URL da mídia" da aula/vídeo (ex.: https://scripts.converteai.net/abc.../players/xyz.../player.js).
 */
export type VTurbSource =
  | { scriptUrl: string }
  | { playerId: string; accountId: string };

function parseSource(input: string): VTurbSource | null {
  if (!input) return null;
  const trimmed = input.trim();
  // Full script URL
  const m = trimmed.match(
    /scripts\.converteai\.net\/([^/]+)\/players\/([^/]+)\/player\.js/i,
  );
  if (m) return { scriptUrl: trimmed, accountId: m[1], playerId: m[2] } as any;
  // Just a UUID → cannot embed without account, but keep for backwards compat
  if (/^[0-9a-f-]{20,}$/i.test(trimmed)) return { playerId: trimmed, accountId: "" };
  return null;
}

export default function VTurbPlayer({
  source,
  className,
  aspect = "16/9",
}: {
  source: string; // media_url from CMS
  className?: string;
  aspect?: string;
}) {
  const parsed = useMemo(() => parseSource(source) as any, [source]);
  const holderRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!parsed?.playerId) return;
    const playerId = parsed.playerId;
    const scriptId = `scr_${playerId}`;
    if (document.getElementById(scriptId)) return; // já carregado

    const scriptUrl: string | undefined =
      parsed.scriptUrl ??
      (parsed.accountId
        ? `https://scripts.converteai.net/${parsed.accountId}/players/${playerId}/player.js`
        : undefined);
    if (!scriptUrl) return;

    const s = document.createElement("script");
    s.id = scriptId;
    s.src = scriptUrl;
    s.async = true;
    document.head.appendChild(s);
    return () => {
      // não removemos o script para permitir reuso; VTurb gerencia instância pelo id do div
    };
  }, [parsed?.playerId, parsed?.accountId, parsed?.scriptUrl]);

  if (!parsed?.playerId) {
    return (
      <div
        className={`w-full bg-neutral-900 text-white/60 flex items-center justify-center text-sm ${className ?? ""}`}
        style={{ aspectRatio: aspect }}
      >
        Vídeo indisponível
      </div>
    );
  }

  return (
    <div
      ref={holderRef}
      id={`vid_${parsed.playerId}`}
      className={className}
      style={{ position: "relative", width: "100%", aspectRatio: aspect }}
    />
  );
}

export { parseSource as parseVTurbSource };