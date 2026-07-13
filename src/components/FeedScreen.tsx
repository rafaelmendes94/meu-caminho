import { useState, useMemo } from"react";
import { Link, useLocation } from"react-router-dom";
import {
 Search, Bell, Bookmark, Play, Headphones, Mic, BookOpen, Sparkles,
 Quote as QuoteIcon, X, Check, Sun, Wind, Heart, MessageCircle, Send, Pause,
 MoreVertical
} from"lucide-react";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { useDisplayUser } from "@/hooks/use-display-user";
import { useCmsItems, type CmsItem } from "@/hooks/use-cms-items";

const brand = "#E07A2B";
const brandSoft = "#F4B27A";
const ink900 = "#1A1410";
const ink700 = "#3D332B";
const ink600 = "#6B5E54";
const ink500 = "#9A8E84";
const cream = "#FBF7F2";
const paper = "#F4EDE4";
const paperNeutral = "#F1F1F1";
const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

/* status bar */
const SignalIcon = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const WifiI = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const BatI = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);

/* Custom outlined action icons (less Instagram) */
const InspireIcon = ({ active = false }: { active?: boolean }) => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? brand :"none"} stroke={active ? brand :"currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
 <path d="M12 3l1.5 4.6h4.8l-3.9 2.8 1.5 4.6L12 12.2 8.1 15l1.5-4.6L5.7 7.6h4.8L12 3z" />
 </svg>
);
const ReflectIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
 <path d="M4 6h16M4 11h12M4 16h8" />
 </svg>
);
const KeepIcon = ({ active = false }: { active?: boolean }) => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? brand :"none"} stroke={active ? brand :"currentColor"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
 <path d="M12 3l3 6 6.5 1-4.7 4.6L18 21l-6-3.2L6 21l1.2-6.4L2.5 10 9 9l3-6z" />
 </svg>
);
const SendOutIcon = () => (
 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
 <path d="M5 12l14-7-4 16-4-7-6-2z" />
 </svg>
);

type PostType ="reflexao" |"audio" |"podcast" |"video" |"livro" |"frase" |"ia" |"exercicio" |"meditacao" |"corte";

type Post = {
 id: string;
 type: PostType;
 to: string;
 subtitle: string;
 badge: string;
 caption: string;
 image: string;
 quote?: string;
 duration?: string;
 inspires: string;
 reflections: string;
 when: string;
};

const FALLBACK_IMG = "https://images.unsplash.com/photo-1500964757637-c85e8a162699?auto=format&fit=crop&w=900&q=80";
const CMS_TYPE_TO_POST: Record<CmsItem["type"], PostType> = {
  book: "livro", podcast: "podcast", video: "video", audio: "audio",
  material: "reflexao", track: "ia", course: "exercicio",
};
const POST_SUBTITLE: Record<PostType, string> = {
  reflexao: "Reflexão", frase: "Reflexão do dia", audio: "Audiolivro", podcast: "Podcast",
  video: "Insight em vídeo", livro: "Novo no Clube do Livro", ia: "Trilha sugerida",
  exercicio: "Exercício de presença", meditacao: "Meditação guiada", corte: "Corte",
};
function timeAgo(iso: string | null): string {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  if (d === 1) return "ontem";
  if (d < 7) return `há ${d}d`;
  return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
function mapCmsToPost(it: CmsItem): Post {
  const t = CMS_TYPE_TO_POST[it.type];
  const dur = it.duration_minutes ? (it.duration_minutes < 60 ? `${it.duration_minutes} min` : `${Math.floor(it.duration_minutes / 60)}h ${it.duration_minutes % 60}min`) : undefined;
  return {
    id: it.id,
    type: t,
    to: `/conteudo/detalhe?slug=${it.slug}`,
    subtitle: POST_SUBTITLE[t],
    badge: it.subtitle || it.title,
    caption: it.short_description || "",
    image: it.cover_url || it.banner_url || FALLBACK_IMG,
    duration: dur,
    inspires: "—",
    reflections: "—",
    when: timeAgo(it.published_at),
  };
}

// Sem posts hardcoded: quando o CMS não retorna itens, o feed exibe estado vazio.
const postsFallback: Post[] = [];

const filters = ["Tudo","Cortes","Reflexão","Áudio","Insight","Exercício","Meditação","Cury IA"] as const;
const filterMap: Record<typeof filters[number], PostType[] | null> = {
"Tudo": null,
"Cortes": ["corte"],
"Reflexão": ["reflexao","frase"],
"Áudio": ["audio","podcast"],
"Insight": ["video"],
"Exercício": ["exercicio"],
"Meditação": ["meditacao"],
"Cury IA": ["ia"],
};

const typeMeta = (t: PostType) => {
 const map = {
 reflexao: { Icon: QuoteIcon, c:"#B5651D", bg:"#F6E8D6", label:"Reflexão" },
 frase: { Icon: QuoteIcon, c:"#B5651D", bg:"#F6E8D6", label:"Reflexão" },
 audio: { Icon: Headphones, c:"#7A6CA8", bg:"#ECE6F4", label:"Áudio" },
 podcast: { Icon: Mic, c:"#5E8F76", bg:"#E4EFE6", label:"Áudio" },
 video: { Icon: Play, c:"#C25E5E", bg:"#F6DFDF", label:"Insight" },
 livro: { Icon: BookOpen, c:"#956A3F", bg:"#EFE3D2", label:"Livro" },
 ia: { Icon: Sparkles, c:"#7A6CA8", bg:"#ECE6F4", label:"Cury IA" },
 exercicio: { Icon: Wind, c:"#5E8F76", bg:"#E4EFE6", label:"Exercício" },
 meditacao: { Icon: Sun, c:"#D08A3F", bg:"#F8E8D2", label:"Meditação" },
 corte: { Icon: Play, c:"#A14B6E", bg:"#F4DDE6", label:"Corte" },
 } as const;
 return map[t];
};

/* ───────────── Premium header widgets ───────────── */

const moods = [
 { e:"🌧", k:"pesado" },
 { e:"🌥", k:"neutro" },
 { e:"🌤", k:"leve" },
 { e:"☀️", k:"ótimo" },
 { e:"✨", k:"inspirado" },
] as const;

const HeaderWidgets = () => {
  const al = useAudienceLink();
  const [mood, setMood] = useState<string | null>(null);
  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');

  

  return (
    <div className={`px-4 lg:px-0 pt-0 pb-4 space-y-3 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 lg:mb-8 max-w-[1200px] ${isEnterprise ? 'ml-0' : 'mx-auto'}`}>
      {/* Daily reflection / pause card */}
      <Link
        to={al("/feed/leitura")}
        className="block relative overflow-hidden rounded-[28px] p-4 active:scale-[0.99] transition"
        style={{
          background: "linear-gradient(135deg, #FFF1DD 0%, #FCE3C5 55%, #F4D0AA 100%)",
          boxShadow: "0 12px 30px -18px rgba(178,108,40,0.45), inset 0 1px 0 rgba(255,255,255,0.55)",
        }}
      >
        <div className="absolute -top-8 -right-8 w-36 h-36 rounded-full" style={{ background: "radial-gradient(circle, rgba(255,255,255,0.55), transparent 70%)" }} />
        <div className="relative flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl flex items-center justify-center bg-white/70 backdrop-blur shadow-sm shrink-0">
            <Sun size={20} style={{ color: brand }} />
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-[10.5px] uppercase tracking-[0.18em] font-semibold" style={{ color: "#9C5A1A" }}>Pausa do dia</p>
            <p className="mt-1 text-[16px] leading-snug text-[#3D2A18]" style={{ ...serif, fontWeight: 500 }}>
              Respire fundo. Seu dia merece um instante de silêncio.
            </p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold" style={{ color: "#7A4316" }}>
              <Pause size={12} /> 3 min · meditação guiada
            </div>
          </div>
        </div>
      </Link>

      {/* Mood check-in + streak */}
      <div className="rounded-[24px] bg-white/80 backdrop-blur border border-white p-3.5 shadow-[0_6px_20px_-14px_rgba(0,0,0,0.15)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10.5px] uppercase tracking-[0.16em] font-semibold" style={{ color: ink500 }}>Como você chega hoje?</p>
            <p className="text-[12.5px] mt-0.5" style={{ color: ink600 }}>Seu check-in alimenta as recomendações.</p>
          </div>
          <div className="text-right leading-tight">
            <p className="text-[18px] font-semibold" style={{ ...serif, color: brand }}>7</p>
            <p className="text-[9.5px] uppercase tracking-wider" style={{ color: ink500 }}>dias seguidos</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          {moods.map((m) => {
            const sel = mood === m.k;
            return (
              <button
                key={m.k}
                onClick={() => setMood(m.k)}
                className="flex flex-col items-center gap-1 active:scale-95 transition"
              >
                <span
                  className="w-11 h-11 rounded-full flex items-center justify-center text-[20px] transition"
                  style={{
                    background: sel ? "linear-gradient(135deg,#FFE3C4,#F8C58A)" : paper,
                    boxShadow: sel ? "0 6px 14px -8px rgba(224,122,43,0.55), inset 0 0 0 1px rgba(224,122,43,0.4)" : "inset 0 0 0 1px rgba(0,0,0,0.04)",
                  }}
                >
                  {m.e}
                </span>
                <span className="text-[9.5px] capitalize" style={{ color: sel ? brand : ink500, fontWeight: sel ? 600 : 500 }}>{m.k}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ───────────── Post card ───────────── */

const PostCard = ({ post, isEnterprise }: { post: Post; isEnterprise?: boolean }) => {
  const al = useAudienceLink();
  const [inspired, setInspired] = useState(false);
  const [kept, setKept] = useState(false);
  const meta = typeMeta(post.type);
  const Icon = meta.Icon;
  const isMedia = post.type === "audio" || post.type === "podcast" || post.type === "video" || post.type === "meditacao" || post.type === "corte";
  const isQuote = post.type === "frase" || (post.type === "ia" && !!post.quote);

  if (isEnterprise) {
    return (
      <article className="group relative bg-white rounded-xl border border-black/5 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-black/5 flex flex-col h-full">
        {/* Media Block - 4:5 aspect ratio often used in social feeds */}
        <Link to={al(post.to)} className="block relative aspect-[4/5] w-full bg-black/5 overflow-hidden">
          <img 
            src={post.image} 
            alt="" 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          />
          
          {/* Overlay for media types */}
          {isMedia && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
              <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-all transform scale-90 group-hover:scale-100">
                <Play size={20} className="text-[#111] fill-[#111] ml-0.5" />
              </div>
            </div>
          )}

          {/* Type Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#111] shadow-sm">
            <Icon size={12} />
            <span className="uppercase tracking-wider">{meta.label}</span>
          </div>

          {/* Duration Badge */}
          {post.duration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white">
              {post.duration}
            </div>
          )}
        </Link>

        {/* Info Area */}
        <div className="p-4 flex flex-col flex-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">{post.subtitle}</span>
            <span className="text-[10px] text-[#999] font-medium">{post.when}</span>
          </div>
          
          <Link to={al(post.to)} className="block mb-3">
            <h3 className="text-[15px] font-bold text-[#111] leading-tight line-clamp-2 group-hover:text-[#F88A2B] transition-colors" style={serif}>
              {post.badge}
            </h3>
            <p className="mt-2 text-[12px] text-[#666] leading-relaxed line-clamp-2">
              {post.caption}
            </p>
          </Link>

          {/* Quote Preview if exists */}
          {isQuote && post.quote && (
            <div className="mt-auto pt-3 border-t border-black/5">
              <p className="text-[12px] italic text-[#888] line-clamp-2">
                "{post.quote}"
              </p>
            </div>
          )}

          {/* Quick Actions */}
          <div className="mt-4 pt-3 border-t border-black/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setInspired(!inspired)} className={`flex items-center gap-1 transition-colors ${inspired ? 'text-[#F88A2B]' : 'text-[#666] hover:text-[#111]'}`}>
                <Heart size={16} fill={inspired ? "#F88A2B" : "none"} />
                <span className="text-[11px] font-bold">{post.inspires}</span>
              </button>
              <button className="flex items-center gap-1 text-[#666] hover:text-[#111]">
                <MessageCircle size={16} />
                <span className="text-[11px] font-bold">{post.reflections}</span>
              </button>
            </div>
            <button onClick={() => setKept(!kept)} className={`transition-colors ${kept ? 'text-[#F88A2B]' : 'text-[#666] hover:text-[#111]'}`}>
              <Bookmark size={16} fill={kept ? "#F88A2B" : "none"} />
            </button>
          </div>
        </div>
      </article>
    );
  }

  return (
  <article className={`mx-4 lg:mx-0 my-3 lg:my-0 rounded-[28px] bg-white border ${isEnterprise ? 'border-black/5' : 'border-[#EFE7DC]'} overflow-hidden shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] transition-all duration-500`}>
 {/* Header */}
 <div className="flex items-center justify-between px-4 pt-3.5 pb-2.5">
 <div className="flex items-center gap-2.5 min-w-0">
 <span
 className="inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[10.5px] font-semibold"
 style={{ background: meta.bg, color: meta.c }}
 >
 <Icon size={11} /> {meta.label}
 </span>
 <span className="text-[10.5px] uppercase tracking-[0.14em]" style={{ color: ink500 }}>
 {post.subtitle}
 </span>
 </div>
 <span className="text-[10px] uppercase tracking-wider" style={{ color: ink500 }}>{post.when}</span>
 </div>

 {/* Editorial title / quote */}
 <Link to={al(post.to)} className="block px-4 pb-3">
 {isQuote && post.quote ? (
 <p className="text-[20px] leading-[1.25] text-[#231911]" style={{ ...serif, fontWeight: 500 }}>
 <span className="text-[#E07A2B] mr-1" style={serif}>“</span>
 {post.quote}
 <span className="text-[#E07A2B]" style={serif}>”</span>
 </p>
 ) : (
 <p className="text-[17px] leading-[1.3] text-[#231911]" style={{ ...serif, fontWeight: 500 }}>
 {post.badge}
 </p>
 )}
 <p className="mt-1.5 text-[12.5px] leading-relaxed" style={{ color: ink600 }}>
 {post.caption}
 </p>
 </Link>

 {/* Media block */}
 <Link to={al(post.to)} className="block px-3">
 <div className="relative w-full aspect-[16/10] rounded-[22px] overflow-hidden bg-[#F0EAE3]">
 <img src={post.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
 {(isMedia || isQuote) && (
 <div
 className="absolute inset-0"
 style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(20,12,4,0.5) 100%)" }}
 />
 )}
 {isMedia && (
 <>
 <span className="absolute inset-0 flex items-center justify-center">
 <span className="w-14 h-14 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
 <Play size={22} className="text-[#1A1410] ml-0.5" fill="#1A1410" />
 </span>
 </span>
 {post.duration && (
 <span className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10.5px] font-semibold text-white" style={{ background:"rgba(0,0,0,0.55)", backdropFilter:"blur(6px)" }}>
 {post.duration}
 </span>
 )}
 </>
 )}
 {post.type ==="livro" && (
 <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background:"rgba(255,255,255,0.95)", backdropFilter:"blur(8px)" }}>
 <BookOpen size={15} style={{ color:"#956A3F" }} />
 <span className="text-[12px] font-semibold text-[#231911] truncate">Continuar leitura</span>
 </div>
 )}
 </div>
 </Link>

 {/* Action bar — pill buttons, custom labels */}
 <div className="px-3 pt-3 pb-3 flex items-center gap-1.5">
 <button
 onClick={() => setInspired((v) => !v)}
 className="flex-1 h-10 rounded-full flex items-center justify-center gap-1.5 text-[11.5px] font-semibold tracking-tight active:scale-[0.97] transition"
  style={{
  background: inspired ?"linear-gradient(135deg,#FFE3C4,#F8C58A)" : (isEnterprise ? paperNeutral : paper),
  color: inspired ? brand : ink700,
  boxShadow: inspired ?"inset 0 0 0 1px rgba(224,122,43,0.35)" :"inset 0 0 0 1px rgba(0,0,0,0.04)",
  }}
 >
 <InspireIcon active={inspired} />
 <span>{inspired ?"Inspirou" :"Inspirar"}</span>
 <span className="ml-0.5 text-[10.5px] font-medium" style={{ color: inspired ? brand : ink500 }}>· {post.inspires}</span>
 </button>
 <Link
 to={post.to}
 className="h-10 px-3.5 rounded-full flex items-center justify-center gap-1.5 text-[11.5px] font-semibold"
  style={{ background: isEnterprise ? paperNeutral : paper, color: ink700, boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.04)" }}
 >
 <ReflectIcon />
 <span className="text-[10.5px]" style={{ color: ink600 }}>{post.reflections}</span>
 </Link>
 <button
 onClick={() => setKept((v) => !v)}
 aria-label="Guardar"
 className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition"
  style={{
  background: kept ?"linear-gradient(135deg,#FFE3C4,#F8C58A)" : (isEnterprise ? paperNeutral : paper),
  color: kept ? brand : ink700,
  boxShadow: kept ?"inset 0 0 0 1px rgba(224,122,43,0.35)" :"inset 0 0 0 1px rgba(0,0,0,0.04)",
  }}
 >
 <KeepIcon active={kept} />
 </button>
 <button
 aria-label="Enviar"
 className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition"
 style={{ background: isEnterprise ? paperNeutral : paper, color: ink700, boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.04)" }}
 >
 <SendOutIcon />
 </button>
 </div>
 </article>
 );
};

/* ───────────── Notifications ───────────── */

type Notif = { id: string; icon:"inspire" |"reflect" |"book" |"ia" |"audio"; title: string; body: string; when: string; unread: boolean; to: string };
const notifications: Notif[] = [
 { id:"n1", icon:"ia", title:"Cury IA preparou algo para você", body:"Uma trilha emocional foi sugerida para sua manhã.", when:"agora", unread: true, to:"/cury-digital/sugestao" },
 { id:"n2", icon:"book", title:"Novo capítulo liberado", body:"Ansiedade — capítulo 4 já está disponível.", when:"há 2h", unread: true, to:"/biblioteca/detalhe" },
 { id:"n3", icon:"inspire", title:"Sua reflexão inspirou 1.2k pessoas", body:"“A mente tranquila vê soluções...”", when:"há 5h", unread: true, to:"/feed/leitura" },
 { id:"n4", icon:"audio", title:"Meditação guiada disponível", body:"Respiração consciente — 5 min.", when:"ontem", unread: false, to:"/player/audio" },
 { id:"n5", icon:"reflect", title:"Augusto Cury respondeu sua reflexão", body:"“Que bonito perceber isso em você...”", when:"ontem", unread: false, to:"/feed" },
 { id:"n6", icon:"book", title:"Continue de onde parou", body:"Mente Serena — Cap. 1 (12 min restantes).", when:"12/06", unread: false, to:"/player/audiolivro" },
];
const notifIcon = (i: Notif["icon"]) => {
 const m = {
 inspire: { I: Heart, c: brand, bg:"#F6E8D6" },
 reflect: { I: MessageCircle, c:"#5E8F76", bg:"#E4EFE6" },
 book: { I: BookOpen, c:"#956A3F", bg:"#EFE3D2" },
 ia: { I: Sparkles, c:"#7A6CA8", bg:"#ECE6F4" },
 audio: { I: Headphones, c:"#7A6CA8", bg:"#ECE6F4" },
 } as const;
 return m[i];
};

/* ───────────── Screen ───────────── */

const FeedScreen = () => {
  const al = useAudienceLink();
  const location = useLocation();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  const LayoutComponent = isEnterprise ? (({ children, title }: { children: React.ReactNode, title?: string }) => <EnterpriseUserLayout title={title || "Feed"}>{children}</EnterpriseUserLayout>) : (({ children }: { children: React.ReactNode }) => <AppUserLayout>{children}</AppUserLayout>);
  const { firstName: userName } = useDisplayUser();
  const userAvatar = isEnterprise ? "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" : "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80";

 const [active, setActive] = useState<typeof filters[number]>("Tudo");
 const [searchOpen, setSearchOpen] = useState(false);
 const [notifOpen, setNotifOpen] = useState(false);
 const [query, setQuery] = useState("");
 const [unread, setUnread] = useState(notifications.filter((n) => n.unread).length);

  const { items: cmsItems } = useCmsItems(undefined, { limit: 30 });
  const posts: Post[] = useMemo(
    () => (cmsItems.length ? cmsItems.map(mapCmsToPost) : postsFallback),
    [cmsItems]
  );

 const visible = useMemo(() => {
 let v = filterMap[active] ? posts.filter((p) => filterMap[active]!.includes(p.type)) : posts;
 if (searchOpen && query.trim()) {
 const q = query.trim().toLowerCase();
 v = v.filter((p) => (p.caption +"" + p.subtitle +"" + p.badge +"" + (p.quote ||"")).toLowerCase().includes(q));
 }
 return v;
 }, [active, query, searchOpen, posts]);

 const markAllRead = () => { notifications.forEach((n) => (n.unread = false)); setUnread(0); };

  return (
    <LayoutComponent title="Feed">
      <main className={`${isEnterprise ? 'w-full' : 'h-screen min-h-[100dvh] w-full flex items-center justify-center overflow-hidden'} font-display`} style={{ background: isEnterprise ? 'transparent' : cream }}>
        <div
          className={`relative w-full ${isEnterprise ? 'bg-transparent' : 'h-[100dvh] overflow-hidden flex flex-col'}`}
          style={{
            background: isEnterprise ? 'transparent' : `radial-gradient(120% 60% at 50% 0%, #FFF1DD 0%, ${cream} 38%, ${cream} 100%)`,
            paddingTop: isEnterprise ? '0' : "env(safe-area-inset-top)",
          }}
        >
  {/* Status bar */}
  {/* Premium soft header */}
  <header className={`relative z-30 px-4 pt-2 pb-3 flex items-center justify-between shrink-0 ${isEnterprise ? 'lg:hidden' : ''}`}>
 <div className="flex items-center gap-3 min-w-0">
 <span className="w-11 h-11 rounded-full p-[2px]" style={{ background:"linear-gradient(135deg,#F8C58A,#E07A2B)" }}>
  <span className="block w-full h-full rounded-full bg-white p-[2px]">
  <span className="block w-full h-full rounded-full bg-cover bg-center" style={{ backgroundImage:`url(${userAvatar})` }} />
  </span>
  </span>
  <div className="leading-tight min-w-0">
  <p className="text-[10.5px] uppercase tracking-[0.16em] font-semibold" style={{ color: ink500 }}>Bom dia</p>
  <p className="text-[19px] truncate" style={{ ...serif, color: ink900, fontWeight: 600 }}>{userName}</p>
 </div>
 </div>
 <div className="flex items-center gap-2">
 <button
 onClick={() => { setSearchOpen((v) => !v); setNotifOpen(false); }}
 aria-label="Buscar"
 className="w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition"
 style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(10px)", boxShadow:"0 4px 14px -8px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.9)" }}
 >
 {searchOpen ? <X size={17} style={{ color: ink700 }} /> : <Search size={17} style={{ color: ink700 }} />}
 </button>
 <button
 onClick={() => { setNotifOpen((v) => !v); setSearchOpen(false); }}
 aria-label="Notificações"
 className="relative w-10 h-10 rounded-full flex items-center justify-center active:scale-95 transition"
 style={{ background:"rgba(255,255,255,0.7)", backdropFilter:"blur(10px)", boxShadow:"0 4px 14px -8px rgba(0,0,0,0.15), inset 0 0 0 1px rgba(255,255,255,0.9)" }}
 >
 <Bell size={17} style={{ color: ink700 }} />
 {unread > 0 && (
 <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-white text-[9.5px] font-bold flex items-center justify-center" style={{ background: brand, boxShadow:"0 0 0 2px" + cream }}>
 {unread}
 </span>
 )}
 </button>
 </div>
 </header>

 {/* Search bar (collapsible) */}
 {searchOpen && (
 <div className={`relative z-30 px-4 pb-2 shrink-0 animate-in fade-in slide-in-from-top-2 duration-200 ${isEnterprise ? 'lg:mt-4' : ''}`}>
 <div className="flex items-center gap-2 h-11 px-4 rounded-full bg-white/80 backdrop-blur" style={{ boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.05), 0 4px 14px -10px rgba(0,0,0,0.15)" }}>
 <Search size={15} style={{ color: ink600 }} />
 <input
 autoFocus
 value={query}
 onChange={(e) => setQuery(e.target.value)}
 placeholder="Buscar reflexões, áudios, insights..."
 className="flex-1 bg-transparent outline-none text-[13px]"
 style={{ color: ink900 }}
 />
 {query && (
 <button onClick={() => setQuery("")} aria-label="Limpar" style={{ color: ink600 }}>
 <X size={15} />
 </button>
 )}
 </div>
 </div>
 )}

  <div className={`relative z-10 flex-1 ${isEnterprise ? 'px-0' : ''}`}>

   {/* Cortes — stories */}
   <div className={`px-4 pt-2 pb-1 ${isEnterprise ? 'lg:px-0 lg:pt-0' : ''}`}>
 <div className="flex items-end justify-between mb-2">
 <div>
 <p className="text-[10.5px] uppercase tracking-[0.18em] font-semibold" style={{ color: brand }}>Cortes do dia</p>
 <p className="text-[14.5px]" style={{ ...serif, color: ink900, fontWeight: 600 }}>Em poucos segundos</p>
 </div>
 <Link to={al("/feed/cortes")} className="text-[11px] font-semibold" style={{ color: brand }}>Ver todos</Link>
 </div>
 <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
 {posts.filter((p) => p.type ==="corte").concat(
 posts.filter((p) => p.type ==="video").slice(0, 1)
 ).concat(
 posts.filter((p) => p.type ==="meditacao").slice(0, 1)
 ).map((p) => (
 <Link
 key={"story-" + p.id}
 to={p.type ==="corte" ?"/feed/cortes" : p.to}
 className="shrink-0 w-[96px] active:scale-[0.97] transition"
 >
 <div
 className="relative w-[96px] h-[140px] rounded-[20px] overflow-hidden"
 style={{ boxShadow:"0 10px 24px -14px rgba(0,0,0,0.45), inset 0 0 0 2px rgba(255,255,255,0.9), inset 0 0 0 4px rgba(224,122,43,0.7)" }}
 >
 <img src={p.image} alt="" className="absolute inset-0 w-full h-full object-cover" loading="lazy" />
 <div className="absolute inset-0" style={{ background:"linear-gradient(180deg, rgba(0,0,0,0) 30%, rgba(20,12,4,0.7) 100%)" }} />
 <span className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 flex items-center justify-center">
 <Play size={11} className="ml-0.5 text-[#1A1410]" fill="#1A1410" />
 </span>
 <p className="absolute bottom-1.5 left-2 right-2 text-[10px] font-semibold text-white leading-tight line-clamp-2">{p.badge}</p>
 </div>
 <p className="mt-1.5 text-[10px] uppercase tracking-wider text-center" style={{ color: ink500 }}>{p.duration ||"Corte"}</p>
 </Link>
 ))}
  </div>
  </div>

  {/* Section title */}
  <div className={`px-4 pt-0 pb-1 flex items-end justify-between ${isEnterprise ? 'lg:px-0 lg:pt-0 lg:mt-4' : ''}`}>
    <div>
      <p className="text-[10.5px] uppercase tracking-[0.18em] font-semibold" style={{ color: brand }}>Stream de reflexão</p>
      <p className="text-[18px]" style={{ ...serif, color: ink900, fontWeight: 600 }}>Curado para você hoje</p>
    </div>
  </div>

  {/* Filter chips */}
  <div className={`px-4 py-3 overflow-x-auto no-scrollbar ${isEnterprise ? 'lg:px-0 lg:bg-transparent' : 'sticky top-0 z-20'}`} style={{ background: isEnterprise ? undefined : `linear-gradient(180deg, ${cream} 70%, rgba(251,247,242,0))` }}>
 <div className="flex items-center gap-1.5 w-max">
 {filters.map((f) => {
 const isActive = active === f;
 return (
 <button
 key={f}
 onClick={() => setActive(f)}
 className="h-8 px-3.5 rounded-full text-[11.5px] font-semibold tracking-tight transition active:scale-95"
 style={isActive
 ? { background: ink900, color: cream, boxShadow:"0 6px 14px -8px rgba(0,0,0,0.4)" }
 : { background:"rgba(255,255,255,0.7)", color: ink700, boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.06)" }}
 >
 {f}
 </button>
 );
 })}
 </div>
 </div>

 {searchOpen && query && (
 <div className="px-5 pt-1 text-[11.5px]" style={{ color: ink600 }}>
 {visible.length} resultado{visible.length === 1 ?"" :"s"} para “{query}”
 </div>
 )}

  <div className={`grid grid-cols-1 ${isEnterprise ? 'sm:grid-cols-2 lg:grid-cols-3 max-w-[1200px] ml-0' : 'max-w-[1200px] mx-auto'} pb-20 gap-6`}>
    {visible.map((p, i) => (
      <div key={p.id}>
        <PostCard post={p} isEnterprise={isEnterprise} />
        {!isEnterprise && i < visible.length - 1 && (
          <div className="flex items-center justify-center py-1 lg:hidden">
            <span className="w-1 h-1 rounded-full" style={{ background: brandSoft, opacity: 0.6 }} />
            <span className="mx-1 w-1 h-1 rounded-full" style={{ background: brandSoft, opacity: 0.4 }} />
            <span className="w-1 h-1 rounded-full" style={{ background: brandSoft, opacity: 0.6 }} />
          </div>
        )}
      </div>
    ))}
  </div>
 {visible.length === 0 && (
 <div className="text-center py-16 text-[12.5px]" style={{ color: ink500 }}>
 Nada por aqui ainda.
 </div>
 )}
 </div>

 {/* Notifications panel */}
 {notifOpen && (
 <>
 <button
 aria-label="Fechar"
 onClick={() => setNotifOpen(false)}
 className="absolute inset-0 z-40 bg-black/30 backdrop-blur-[2px] animate-in fade-in duration-150"
 />
 <div
 className="absolute left-3 right-3 top-3 z-50 flex flex-col rounded-[28px] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.4)] animate-in slide-in-from-top duration-200 max-h-[80%] overflow-hidden"
 style={{ background: cream, paddingTop:"env(safe-area-inset-top)" }}
 >
 <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-[#EFE7DC]">
 <div>
 <p className="text-[10.5px] uppercase tracking-[0.16em] font-semibold" style={{ color: brand }}>Atualizações</p>
 <h3 className="text-[18px]" style={{ ...serif, color: ink900, fontWeight: 600 }}>Notificações</h3>
 <p className="text-[11px] mt-0.5" style={{ color: ink600 }}>{unread > 0 ? `${unread} não lida${unread === 1 ?"" :"s"}` :"Tudo em dia"}</p>
 </div>
 <div className="flex items-center gap-2">
 {unread > 0 && (
 <button onClick={markAllRead} className="h-8 px-3 rounded-full text-[11.5px] font-semibold flex items-center gap-1" style={{ background:"#F6E8D6", color: brand }}>
 <Check size={13} /> Marcar todas
 </button>
 )}
 <button onClick={() => setNotifOpen(false)} aria-label="Fechar" className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background:"rgba(255,255,255,0.8)", boxShadow:"inset 0 0 0 1px rgba(0,0,0,0.05)" }}>
 <X size={16} style={{ color: ink700 }} />
 </button>
 </div>
 </div>
 <div className=" flex-1">
 {notifications.map((n) => {
 const meta = notifIcon(n.icon);
 const I = meta.I;
 return (
  <Link
  key={n.id}
  to={n.to}
  onClick={() => setNotifOpen(false)}
  className="flex items-start gap-3 px-4 py-3 border-b border-[#F2EAE0] active:bg-white/60"
  style={{ background: n.unread ?"rgba(224,122,43,0.05)" :"transparent" }}
  >
  <span className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
  <I size={17} style={{ color: meta.c }} />
  </span>
  <div className="flex-1 min-w-0">
  <p className="text-[13px] font-semibold leading-snug" style={{ color: ink900 }}>{n.title}</p>
  <p className="text-[12px] leading-snug mt-0.5" style={{ color: ink600 }}>{n.body}</p>
  <p className="mt-1 text-[10px] uppercase tracking-wider" style={{ color: ink500 }}>{n.when}</p>
  </div>
  {n.unread && <span className="w-2 h-2 rounded-full mt-2 shrink-0" style={{ background: brand }} />}
  </Link>
 );
 })}
 </div>
 </div>
 </>
 )}

 {/* Bottom nav (floating glass — provided by component) */}
 </div>

 <style>{`
 .no-scrollbar::-webkit-scrollbar { display: none; }
 .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
 `}</style>
  </main>
  </LayoutComponent>
  );
};

export default FeedScreen;
