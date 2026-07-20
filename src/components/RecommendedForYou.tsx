import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAudienceLink } from "@/hooks/use-audience";
import type { CmsItem } from "@/hooks/use-cms-items";

type Recommendation = { id: string; reason: string };

const TYPE_LABEL: Record<CmsItem["type"], string> = {
  book: "Leitura", course: "Curso", track: "Trilha",
  podcast: "Podcast", video: "Vídeo", audio: "Áudio", material: "Material",
  reflection: "Reflexão", exercise: "Exercício", ritual: "Ritual", message: "Mensagem",
};

function pathFor(item: CmsItem, al: (p: string) => string): string {
  const s = encodeURIComponent(item.slug);
  switch (item.type) {
    case "book": return al(`/biblioteca/leitor?livro=${s}`);
    case "audio": return al(`/player/audio?slug=${s}`);
    case "podcast": return al(`/player/podcast?slug=${s}`);
    case "video": return al(`/conteudo/video?slug=${s}`);
    case "material": return al(`/conteudo/leitura?slug=${s}`);
    case "course": return al(`/curso?slug=${s}`);
    case "track": return al(`/trilha?slug=${s}`);
    default: return al(`/conteudo/detalhe?slug=${s}`);
  }
}

export function RecommendedForYou({ mood, interest, preferredType, limit = 6, title = "Recomendado para você" }: {
  mood?: string; interest?: string; preferredType?: CmsItem["type"]; limit?: number; title?: string;
}) {
  const al = useAudienceLink();
  const [items, setItems] = useState<Array<CmsItem & { reason?: string }>>([]);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true); setError(null);
      try {
        const { data, error } = await supabase.functions.invoke("cms-recommend", {
          body: { mood, interest, preferred_type: preferredType, limit },
        });
        if (!alive) return;
        if (error) throw error;
        const recs: Recommendation[] = data?.items ?? [];
        setMessage(data?.message ?? "");
        if (recs.length === 0) { setItems([]); setLoading(false); return; }
        const ids = recs.map((r) => r.id);
        const { data: full } = await supabase.from("content_items").select("*").in("id", ids).eq("status", "published");
        const byId = new Map((full ?? []).map((f: any) => [f.id, f]));
        const ordered = recs.map((r) => {
          const f = byId.get(r.id);
          return f ? { ...(f as any), reason: r.reason } : null;
        }).filter(Boolean) as any[];
        if (alive) setItems(ordered);
      } catch (e: any) {
        if (alive) setError(e?.message ?? "Falha ao gerar recomendações.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [mood, interest, preferredType, limit]);

  if (loading) {
    return (
      <div className="px-5 py-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] animate-pulse" />
          <span className="text-[10.5px] uppercase tracking-[0.22em] text-[#8A7868]">IA preparando suas recomendações…</span>
        </div>
      </div>
    );
  }

  if (error || items.length === 0) return null;

  return (
    <section className="px-5 py-4">
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.22em] text-[#F88A2B] font-semibold">Curado por IA</p>
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-[20px] leading-tight text-[#111]">{title}</h3>
        </div>
      </div>
      {message && <p className="text-[11px] text-[#7A6A5C] mb-3">{message}</p>}
      <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5 pb-2">
        {items.map((it) => (
          <Link key={it.id} to={pathFor(it, al)} className="w-[200px] shrink-0 group">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-[0_10px_22px_rgba(0,0,0,0.10)] mb-2">
              {it.cover_url ? (
                <img src={it.cover_url} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              ) : (
                <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,#FBE7C7 0%,#F5C786 50%,#C25A2A 100%)" }} />
              )}
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg,transparent 40%,rgba(15,8,2,0.85))" }} />
              <span className="absolute top-2 left-2 text-[9px] uppercase tracking-[0.18em] text-white/95 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur">{TYPE_LABEL[it.type]}</span>
              {it.is_premium && <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#F88A2B] text-white">PREMIUM</span>}
              <div className="absolute inset-x-0 bottom-0 p-3 text-white">
                <p className="text-[13px] font-semibold leading-tight line-clamp-2">{it.title}</p>
              </div>
            </div>
            {it.reason && <p className="text-[11px] text-[#5C4E42] line-clamp-2 leading-snug">{it.reason}</p>}
          </Link>
        ))}
      </div>
    </section>
  );
}

export default RecommendedForYou;