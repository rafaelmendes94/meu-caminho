import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AppUserLayout } from "./layouts/AppUserLayout";
import {
  ArrowLeft, Share2, Bookmark, BookmarkCheck, Headphones, Play,
  Star, Clock, BookOpen, Quote, ChevronRight, Heart, Sparkles, Lock, Check,
} from "lucide-react";

const serif = { fontFamily: "'Playfair Display', Georgia, serif" };
const sans = { fontFamily: "'Inter', system-ui, sans-serif" };

const chapters = [
  { n: 1, t: "O despertar interior", min: 12, status: "done" as const },
  { n: 2, t: "Reescrevendo a história", min: 18, status: "done" as const },
  { n: 3, t: "A coragem da entrega", min: 22, status: "done" as const },
  { n: 4, t: "O território dos sonhos", min: 16, status: "current" as const, pct: 0.62 },
  { n: 5, t: "A sabedoria do tempo", min: 20, status: "todo" as const },
  { n: 6, t: "O poder do silêncio", min: 14, status: "todo" as const },
  { n: 7, t: "Recomeços possíveis", min: 24, status: "todo" as const },
];

const quotes = [
  "A coragem não é a ausência do medo, mas a decisão de seguir apesar dele.",
  "Sonhar é a primeira forma de transformar a realidade.",
  "Os grandes começos começam em silêncio.",
];

// Reviews are now defined inside the component to handle context


export default function BookDetailScreen() {
  const isEnterprise = useLocation().pathname.startsWith('/enterprise');
  const reviews = [
    { name: "Marina S.", emotion: "Transformador", color: "#F8B05A", text: "Mudou a forma como eu enxergo meus próprios limites." },
    { name: "Rafael T.", emotion: "Profundo", color: "#A8C5F0", text: "Cada capítulo é uma conversa franca com a alma." },
    { name: isEnterprise ? "Juliana M." : "Rafael T.", emotion: "Emocionante", color: "#E89A9A", text: "Chorei. Ri. E principalmente: refleti." },
  ];

  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"sobre" | "capitulos" | "frases" | "avaliacoes">("sobre");

  const totalMin = chapters.reduce((a, c) => a + c.min, 0);
  const done = chapters.filter(c => c.status === "done").length;
  const pct = done / chapters.length;

  return (
    <AppUserLayout>
    <div className="min-h-screen w-full" style={{ ...sans, background: "radial-gradient(120% 90% at 50% 0%, #FBF6EE 0%, #F4ECDF 60%, #EBE0CC 100%)", color: "#221912" }}>
      <style>{`
        @keyframes fadeUp { from {opacity:0; transform:translateY(14px);} to {opacity:1; transform:none;} }
        @keyframes float { 0%,100%{transform:translateY(0) rotate(-1deg);} 50%{transform:translateY(-6px) rotate(1deg);} }
        @keyframes glow { 0%,100%{opacity:.5;} 50%{opacity:.85;} }
        @keyframes shine { 0%{background-position:-200% 0;} 100%{background-position:200% 0;} }
        .fade-up{animation:fadeUp .8s ease both;}
        .float{animation:float 6s ease-in-out infinite;}
        .glow{animation:glow 4s ease-in-out infinite;}
        .shine{background:linear-gradient(90deg, transparent, rgba(248,176,90,.5), transparent); background-size:200% 100%; animation: shine 2.6s linear infinite;}
        .no-scrollbar::-webkit-scrollbar{display:none}
      `}</style>

      <div className="mx-auto max-w-[440px] pb-32">
        {/* Hero */}
        <div className="relative pt-3 px-5">
          <div className="flex items-center justify-between mb-6">
            <Link to="/biblioteca" className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}><ArrowLeft size={18} /></Link>
            <div className="text-[11px] tracking-[0.3em] uppercase opacity-60">Biblioteca</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setSaved(s => !s)} className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}>
                {saved ? <BookmarkCheck size={16} fill="#9A6B2C" color="#9A6B2C" /> : <Bookmark size={16} />}
              </button>
              <button className="w-9 h-9 rounded-full grid place-items-center" style={{ background: "rgba(34,25,18,0.06)" }}><Share2 size={16} /></button>
            </div>
          </div>

          {/* cover */}
          <div className="relative grid place-items-center my-6 h-[260px]">
            <div className="absolute inset-0 grid place-items-center">
              <div className="w-[280px] h-[280px] rounded-full glow" style={{ background: "radial-gradient(closest-side, rgba(248,176,90,0.4), transparent 70%)" }} />
            </div>
            <div className="float relative">
              <div className="w-[160px] aspect-[3/4] rounded-xl relative overflow-hidden" style={{
                background: "linear-gradient(160deg, #8B4A28, #3A1F12)",
                boxShadow: "0 30px 60px -16px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.06)",
              }}>
                <div className="absolute inset-0" style={{ background: "radial-gradient(120% 80% at 30% 0%, rgba(248,176,90,0.3), transparent 60%)" }} />
                <div className="absolute inset-x-4 top-5 text-[8px] tracking-[0.3em] uppercase opacity-80" style={{ color: "#F8B05A" }}>Augusto Cury</div>
                <div className="absolute inset-x-4 bottom-5">
                  <div className="text-[14px] leading-tight mb-1" style={{ ...serif, color: "#F4E7CE" }}>O vendedor de sonhos</div>
                  <div className="h-[1px] w-8" style={{ background: "#F8B05A" }} />
                </div>
                <div className="absolute inset-y-0 left-0 w-[3px]" style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.5), transparent, rgba(0,0,0,0.5))" }} />
              </div>
            </div>
          </div>

          {/* title block */}
          <div className="fade-up text-center mb-6">
            <div className="text-[10px] tracking-[0.4em] uppercase mb-2" style={{ color: "#9A6B2C" }}>Augusto Cury</div>
            <h1 className="text-[28px] leading-[1.1] mb-2" style={serif}>O vendedor de sonhos</h1>
            <p className="text-[12px] opacity-60 max-w-[280px] mx-auto">Romance contemplativo · Edição premium</p>
          </div>

          {/* meta row */}
          <div className="fade-up flex items-center justify-center gap-5 text-[11px] opacity-65 mb-6">
            <span className="flex items-center gap-1.5"><Star size={12} fill="#F8B05A" color="#F8B05A" /> 4.9</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1.5"><Clock size={12} /> {Math.floor(totalMin/60)}h {totalMin%60}m</span>
            <span className="opacity-40">·</span>
            <span className="flex items-center gap-1.5"><BookOpen size={12} /> {chapters.length} cap.</span>
          </div>

          {/* progress */}
          <div className="fade-up rounded-2xl p-4 mb-6" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] opacity-60">Sua leitura</span>
              <span className="text-[11px]" style={{ color: "#9A6B2C" }}>{Math.round(pct * 100)}% concluído</span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "rgba(34,25,18,0.08)" }}>
              <div className="h-full" style={{ width: `${pct * 100}%`, background: "linear-gradient(90deg, #F8B05A, #C28A3E)" }} />
            </div>
            <div className="text-[10px] opacity-55 mt-2">{done} de {chapters.length} capítulos · próximo: {chapters.find(c => c.status === "current")?.t}</div>
          </div>

          {/* primary actions */}
          <div className="fade-up grid grid-cols-[1fr_auto] gap-3 mb-3">
            <Link to="/biblioteca/leitor" className="rounded-full py-3.5 grid place-items-center text-[13px] font-medium relative overflow-hidden" style={{
              background: "linear-gradient(135deg, #1B130D, #3A2818)", color: "#F4E7CE",
              boxShadow: "0 14px 30px -14px rgba(27,19,13,0.6)",
            }}>
              <span className="flex items-center gap-2"><Play size={14} fill="currentColor" /> Começar leitura</span>
            </Link>
            <Link to="/player/audiolivro" className="px-5 rounded-full grid place-items-center" style={{
              background: "rgba(34,25,18,0.06)", border: "1px solid rgba(34,25,18,0.08)",
            }}>
              <Headphones size={16} />
            </Link>
          </div>
          <button className="fade-up w-full rounded-full py-2.5 text-[12px] opacity-65 mb-8 flex items-center justify-center gap-1.5">
            <Sparkles size={12} /> Ouvir prévia · 2 min
          </button>
        </div>

        {/* Tabs */}
        <div className="px-5 mb-5 fade-up">
          <div className="flex gap-1 p-1 rounded-full" style={{ background: "rgba(34,25,18,0.06)" }}>
            {([
              ["sobre", "Sobre"],
              ["capitulos", "Capítulos"],
              ["frases", "Frases"],
              ["avaliacoes", "Reações"],
            ] as const).map(([k, l]) => (
              <button key={k} onClick={() => setTab(k)} className="flex-1 py-2 rounded-full text-[11px] transition-all" style={{
                background: tab === k ? "#1B130D" : "transparent",
                color: tab === k ? "#F4E7CE" : "rgba(34,25,18,0.6)",
              }}>{l}</button>
            ))}
          </div>
        </div>

        <div className="px-5">
          {tab === "sobre" && (
            <div className="fade-up space-y-6">
              <div>
                <h3 className="text-[16px] mb-3" style={serif}>Sobre a obra</h3>
                <p className="text-[14px] leading-relaxed opacity-75">
                  Em uma narrativa que beira a poesia, Augusto Cury apresenta um homem que, ao perder tudo, decide vender o bem mais raro do mundo: <em>sonhos</em>. Uma jornada sobre o valor da vida, da coragem e da reconstrução interior.
                </p>
                <p className="text-[14px] leading-relaxed opacity-75 mt-3">
                  Ao longo de sete capítulos contemplativos, o leitor é convidado a olhar para dentro e descobrir o vendedor de sonhos que vive em si.
                </p>
              </div>

              <div className="rounded-2xl p-5" style={{ background: "linear-gradient(160deg, #1B130D, #2A1D12)", color: "#F4E7CE" }}>
                <Quote size={16} style={{ color: "#F8B05A" }} className="mb-3" />
                <p className="text-[15px] leading-relaxed mb-3" style={{ ...serif, fontStyle: "italic" }}>"Os sonhos são a única coisa que ninguém pode roubar de você."</p>
                <div className="text-[10px] tracking-[0.3em] uppercase opacity-60">Augusto Cury</div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[["312", "páginas"], ["7", "capítulos"], ["5h 40m", "leitura"]].map(([v, l], i) => (
                  <div key={i} className="rounded-xl p-3 text-center" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
                    <div className="text-[16px]" style={serif}>{v}</div>
                    <div className="text-[10px] opacity-55 mt-0.5">{l}</div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-[14px] mb-3" style={serif}>Temas desta obra</h3>
                <div className="flex flex-wrap gap-2">
                  {["Reconstrução", "Coragem", "Sonhos", "Resiliência", "Sentido", "Recomeço"].map((t) => (
                    <span key={t} className="px-3 py-1.5 rounded-full text-[11px]" style={{ background: "rgba(248,176,90,0.12)", color: "#9A6B2C", border: "1px solid rgba(194,138,62,0.2)" }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === "capitulos" && (
            <ol className="fade-up space-y-2">
              {chapters.map((c) => (
                <Link key={c.n} to={c.status === "todo" ? "/biblioteca/bloqueado" : "/biblioteca/leitor"}
                  className="flex items-center gap-4 rounded-xl p-3 transition-all hover:translate-x-1"
                  style={{ background: c.status === "current" ? "rgba(248,176,90,0.1)" : "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
                  <div className="w-9 h-9 rounded-full grid place-items-center shrink-0 text-[12px]" style={{
                    background: c.status === "done" ? "#1B130D" : c.status === "current" ? "linear-gradient(135deg, #F8B05A, #C28A3E)" : "rgba(34,25,18,0.05)",
                    color: c.status === "todo" ? "#9A8675" : "#F4E7CE",
                    ...serif,
                  }}>
                    {c.status === "done" ? <Check size={14} /> : c.status === "current" ? <Play size={11} fill="currentColor" /> : c.n.toString().padStart(2, "0")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] truncate" style={serif}>{c.t}</div>
                    <div className="text-[10px] opacity-55 flex items-center gap-2">
                      <span>Cap. {c.n.toString().padStart(2, "0")}</span><span>·</span><span>{c.min} min</span>
                      {c.status === "current" && <><span>·</span><span style={{ color: "#9A6B2C" }}>{Math.round((c.pct ?? 0) * 100)}%</span></>}
                    </div>
                  </div>
                  {c.status === "todo" ? <Lock size={13} className="opacity-40" /> : <ChevronRight size={14} className="opacity-40" />}
                </Link>
              ))}
            </ol>
          )}

          {tab === "frases" && (
            <div className="fade-up space-y-3">
              {quotes.map((q, i) => (
                <div key={i} className="rounded-2xl p-5" style={{ background: "linear-gradient(160deg, #FFFDF8, #F4ECDF)", border: "1px solid rgba(194,138,62,0.18)" }}>
                  <Quote size={14} style={{ color: "#9A6B2C" }} className="opacity-60 mb-3" />
                  <p className="text-[14px] leading-relaxed" style={{ ...serif, fontStyle: "italic" }}>"{q}"</p>
                  <div className="flex items-center justify-between mt-4 text-[10px] opacity-55">
                    <span className="tracking-[0.2em] uppercase">Cap. {String(i + 1).padStart(2, "0")}</span>
                    <button className="flex items-center gap-1"><Heart size={11} /> Salvar</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "avaliacoes" && (
            <div className="fade-up space-y-5">
              {/* emotion summary */}
              <div className="rounded-2xl p-5" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-[28px]" style={serif}>4.9</div>
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#F8B05A" color="#F8B05A" />)}
                    </div>
                    <div className="text-[10px] opacity-55 mt-1">2.847 leitores</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] tracking-[0.25em] uppercase opacity-55 mb-2">Sentimento</div>
                    <div className="flex gap-1.5">
                      {[
                        { e: "Profundo", c: "#A8C5F0" },
                        { e: "Inspirador", c: "#F8B05A" },
                        { e: "Emocionante", c: "#E89A9A" },
                      ].map((t) => (
                        <span key={t.e} className="text-[9px] px-2 py-1 rounded-full" style={{ background: `${t.c}25`, color: "#221912" }}>{t.e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {reviews.map((r, i) => (
                <div key={i} className="rounded-2xl p-4" style={{ background: "rgba(255,253,248,0.7)", border: "1px solid rgba(34,25,18,0.06)" }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full grid place-items-center text-[11px]" style={{ background: "rgba(248,176,90,0.18)", color: "#9A6B2C", ...serif }}>{r.name[0]}</div>
                      <div className="text-[12px]" style={serif}>{r.name}</div>
                    </div>
                    <span className="text-[10px] px-2 py-1 rounded-full" style={{ background: `${r.color}25`, color: "#221912" }}>{r.emotion}</span>
                  </div>
                  <p className="text-[13px] leading-relaxed opacity-75">"{r.text}"</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* floating CTA */}
      <div className="fixed bottom-0 left-0 right-0 px-5 pb-6 pt-10" style={{ background: "linear-gradient(to top, #EBE0CC 60%, transparent)" }}>
        <div className="mx-auto max-w-[440px] grid grid-cols-[1fr_auto] gap-3">
          <Link to="/biblioteca/leitor" className="rounded-full py-4 grid place-items-center text-[14px] font-medium relative overflow-hidden" style={{
            background: "linear-gradient(135deg, #F8B05A, #C28A3E)", color: "#1B130D",
            boxShadow: "0 18px 40px -16px rgba(248,176,90,0.55)",
          }}>
            <span className="absolute inset-0 shine opacity-40" />
            <span className="relative flex items-center gap-2"><Play size={14} fill="currentColor" /> Começar leitura</span>
          </Link>
          <Link to="/player/audiolivro" className="px-5 rounded-full grid place-items-center" style={{ background: "#1B130D", color: "#F4E7CE" }}>
            <Headphones size={16} />
          </Link>
        </div>
      </div>
    </div>
    </AppUserLayout>
  );
}
