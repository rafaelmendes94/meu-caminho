import { Link } from"react-router-dom";
import heroImg from"@/assets/trilha/aula-hero.jpg";
import matPdf from"@/assets/trilha/mat-pdf.jpg";
import matAudio from"@/assets/trilha/mat-audio.jpg";
import matChecklist from"@/assets/trilha/mat-checklist.jpg";
import matDiario from"@/assets/trilha/mat-diario.jpg";
import matPratica from"@/assets/trilha/mat-pratica.jpg";
import { AppUserLayout } from "./layouts/AppUserLayout";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { MediaDesktopLayout, SidePanelCard } from "./layouts/MediaDesktopLayout";
import { useAudienceLink } from "@/hooks/use-audience";
import { ArrowLeft, ExternalLink } from "lucide-react";

const ink900 ="#111111";
const ink600 ="#5A544E";
const ink500 ="#8A847E";
const brand ="#F88A2B";
const sage ="#8FB17D";
const lilac ="#9B8AC9";
const bg ="#F7F4F2";

const serif = { fontFamily:"'Playfair Display', Georgia, serif", letterSpacing:"-0.02em" } as const;

const Signal = () => (<svg width="17" height="11" viewBox="0 0 17 11" fill="currentColor"><rect x="0" y="7" width="3" height="4" rx="0.5"/><rect x="4.5" y="5" width="3" height="6" rx="0.5"/><rect x="9" y="2.5" width="3" height="8.5" rx="0.5"/><rect x="13.5" y="0" width="3" height="11" rx="0.5"/></svg>);
const Wifi = () => (<svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor"><path d="M8 2c2.5 0 4.8 1 6.5 2.6.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0C11.4 5.3 9.7 4.6 8 4.6S4.6 5.3 3.4 6.5c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C3.2 3 5.5 2 8 2z"/><path d="M8 6.2c1.4 0 2.6.5 3.6 1.4.3.3.3.7 0 1l-.9.9c-.3.3-.7.3-1 0-.5-.4-1.1-.7-1.7-.7s-1.2.3-1.7.7c-.3.3-.7.3-1 0l-.9-.9c-.3-.3-.3-.7 0-1C5.4 6.7 6.6 6.2 8 6.2z"/><circle cx="8" cy="10" r="1"/></svg>);
const Battery = () => (<svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="2.5" stroke="currentColor" opacity="0.5"/><rect x="2" y="2" width="18" height="8" rx="1.5" fill="currentColor"/><rect x="22.5" y="4" width="1.5" height="4" rx="0.5" fill="currentColor" opacity="0.5"/></svg>);
const ChevL = () => <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>;
const DownloadIco = ({ c ="#111", s = 17 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4v12m0 0l-4-4m4 4l4-4"/><path d="M5 20h14"/></svg>;
const Clock = ({ c = ink500 }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
const Check = ({ c ="#fff" }: { c?: string }) => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7"/></svg>;
const Lock = ({ c ="#7A746E", s = 14 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>;
const PlayCircle = ({ c ="#fff", s = 36 }: { c?: string; s?: number }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.4"><circle cx="12" cy="12" r="10"/><path d="M10 8.5v7l6-3.5-6-3.5z" fill={c} stroke="none"/></svg>;
const FileIco = ({ c = sage }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>;
const Headphone = ({ c = brand }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 14v-2a9 9 0 0 1 18 0v2"/><path d="M3 14h4v6H4a1 1 0 0 1-1-1z"/><path d="M21 14h-4v6h3a1 1 0 0 0 1-1z"/></svg>;
const CheckBoxIco = ({ c = lilac }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 12l3 3 5-6"/></svg>;
const Pencil = ({ c = brand }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 20h4l11-11-4-4L4 16z"/><path d="M14 6l4 4"/></svg>;
const Sparkle = ({ c = brand }: { c?: string }) => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 4l1.5 4L18 9.5 13.5 11 12 15l-1.5-4L6 9.5 10.5 8z"/><path d="M19 16l.7 1.8L21.5 18.5l-1.8.7L19 21l-.7-1.8L16.5 18.5l1.8-.7z"/></svg>;
const Star = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l2.7 5.5 6 .9-4.4 4.3 1 6L12 17l-5.4 2.7 1-6L3.3 9.4l6-.9L12 3z"/></svg>;
const BookIco = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M4 5a2 2 0 0 1 2-2h12v18H6a2 2 0 0 1-2-2z"/><path d="M8 7h7M8 11h7"/></svg>;
const Sprig = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={brand} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 4c2 3 2 6 0 8-2-2-2-5 0-8z"/><path d="M5 13c3 0 5 1 6 3-3 0-5-1-6-3z"/><path d="M19 13c-3 0-5 1-6 3 3 0 5-1 6-3z"/></svg>;

type Status ="downloaded" |"download" |"locked";
type Mat = {
 type: string; typeColor: string; TypeIcon: () => JSX.Element;
 title: string; desc: string; meta: string; status: Status;
 img: string; imgOverlay?:"play" |"minutes"; minutes?: string;
};

const materiais: Mat[] = [
 { type:"PDF REFLEXIVO", typeColor: sage, TypeIcon: () => <FileIco c={sage}/>, title:"Exercícios reflexivos", desc:"Atividades práticas para identificar e transformar pensamentos acelerados.", meta:"—", status:"locked", img: matPdf },
 { type:"ÁUDIO GUIADO", typeColor: brand, TypeIcon: () => <Headphone c={brand}/>, title:"Respiração e presença", desc:"Áudio guiado para acalmar a mente e recuperar o foco.", meta:"—", status:"locked", img: matAudio },
 { type:"CHECKLIST", typeColor: lilac, TypeIcon: () => <CheckBoxIco c={lilac}/>, title:"Checklist de clareza mental", desc:"Passos práticos para organizar seus pensamentos e prioridades.", meta:"—", status:"locked", img: matChecklist },
 { type:"DIÁRIO EMOCIONAL", typeColor: brand, TypeIcon: () => <Pencil c={brand}/>, title:"Diário emocional", desc:"Espaço para registrar pensamentos, emoções e aprendizados.", meta:"—", status:"locked", img: matDiario },
 { type:"EXERCÍCIO DO DIA", typeColor:"#C28B3A", TypeIcon: () => <Sparkle c="#C28B3A"/>, title:"Prática de desaceleração", desc:"Exercício rápido para aplicar hoje e sentir a diferença.", meta:"—", status:"locked", img: matPratica },
];

const StatusAction = ({ status }: { status: Status }) => {
 if (status ==="downloaded") {
 return (
 <div className="flex flex-col items-center gap-1.5">
 <span className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background:"#E3ECDD", boxShadow:"inset 0 0 0 1px rgba(143,177,125,0.35)" }}>
 <Check c={sage} />
 </span>
 <span className="text-[10px]" style={{ color: ink500 }}>Baixado</span>
 </div>
 );
 }
 if (status ==="locked") {
 return (
 <div className="flex flex-col items-center gap-1.5">
 <span className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background:"#ECE6F4" }}>
 <Lock c="#7A6FA8" s={15}/>
 </span>
 <span className="text-[9px] leading-tight text-center max-w-[64px]" style={{ color: ink500 }}>
 Disponível no<br/>próximo módulo
 </span>
 </div>
 );
 }
 return (
 <div className="flex flex-col items-center gap-1.5">
 <span className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background:"#FFEFD9", boxShadow:"inset 0 0 0 1px rgba(248,138,43,0.25)" }}>
 <DownloadIco c={brand} s={18}/>
 </span>
 <span className="text-[10px] font-semibold" style={{ color: brand }}>Baixar</span>
 </div>
 );
};

const MatCard = ({ m }: { m: Mat }) => {
 const isLock = m.status ==="locked";
 return (
 <button
 type="button"
 disabled={isLock}
 className="group w-full flex items-stretch text-left bg-white rounded-[20px] overflow-hidden transition active:scale-[0.995]"
 style={{ boxShadow:"0 2px 12px rgba(17,17,17,0.04), inset 0 0 0 1px rgba(17,17,17,0.05)" }}
 >
 <div className="relative w-[112px] shrink-0 overflow-hidden">
 <img src={m.img} alt="" loading="lazy" width={512} height={512} className={`absolute inset-0 w-full h-full object-cover ${isLock ?"grayscale-[45%] opacity-80" :""}`} />
 {m.imgOverlay ==="play" && (
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="w-10 h-10 rounded-full flex items-center justify-center bg-white/85 backdrop-blur-sm">
 <PlayCircle c="#111" s={22}/>
 </span>
 </div>
 )}
 {m.imgOverlay ==="minutes" && (
 <div className="absolute top-2 left-2">
 <span className="flex flex-col items-center justify-center w-[36px] h-[36px] rounded-full bg-white/90 backdrop-blur-sm leading-none" style={{ boxShadow:"inset 0 0 0 1px rgba(17,17,17,0.06)" }}>
 <span className="text-[12px] font-bold text-[#111]">{m.minutes}</span>
 <span className="text-[7.5px] mt-0.5" style={{ color: ink500 }}>min</span>
 </span>
 </div>
 )}
 </div>

 <div className="flex-1 min-w-0 py-3 pl-3 pr-2 flex flex-col justify-center">
 <div className="flex items-center gap-1.5">
 <m.TypeIcon/>
 <span className="text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: m.typeColor }}>{m.type}</span>
 </div>
 <h4 className="mt-1 text-[14px] leading-[1.2] text-[#111] truncate" style={{ ...serif, fontWeight: 600, color: isLock ?"#7A746E" : ink900 }}>
 {m.title}
 </h4>
 <p className="mt-1 text-[11px] leading-[15px]" style={{ color: isLock ?"#A8A29C" : ink600 }}>{m.desc}</p>
 <div className="mt-1.5 flex items-center gap-1">
 {m.meta.includes("min") && <Clock c={ink500}/>}
 <span className="text-[10.5px]" style={{ color: ink500 }}>{m.meta}</span>
 </div>
 </div>

 <div className="self-center pr-3 pl-1">
 <StatusAction status={m.status} />
 </div>
 </button>
 );
};

const MateriaisScreen = () => {
  const al = useAudienceLink();
  const isEnterprise = location.pathname.startsWith('/enterprise');
  
  const Layout = isEnterprise 
    ? (({ children }: any) => <EnterpriseUserLayout title="Materiais">{children}</EnterpriseUserLayout>) 
    : (({ children }: any) => <AppUserLayout>{children}</AppUserLayout>);

  const content = (
    <div className={`relative w-full min-h-screen flex flex-col font-display ${isEnterprise ? 'lg:min-h-0' : ''}`} style={{ background: isEnterprise ? 'transparent' : bg }}>
      {/* Background Glows - Mobile only or non-enterprise */}
      {!isEnterprise && (
        <>
          <div className="pointer-events-none absolute -top-24 -right-16 w-[260px] h-[260px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(248,138,43,0.14), transparent 70%)", filter:"blur(8px)" }} />
          <div className="pointer-events-none absolute top-[60%] -left-24 w-[240px] h-[240px] rounded-full" style={{ background:"radial-gradient(closest-side, rgba(155,138,201,0.10), transparent 70%)", filter:"blur(8px)" }} />
        </>
      )}

      {/* Header - Mobile only */}
      <div className={`relative flex items-center justify-between px-5 pt-2 pb-1.5 lg:hidden`}>
        <Link to={al("/aula")} aria-label="Voltar" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
          <ChevL/>
        </Link>
        <h1 className="text-[14px] text-[#111] truncate px-2" style={{ ...serif, fontWeight: 600 }}>
          Materiais Complementares
        </h1>
        <button aria-label="Baixar tudo" className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-[#111] ring-1 ring-black/5 active:scale-95 transition" style={{ boxShadow:"0 2px 8px rgba(17,17,17,0.04)" }}>
          <DownloadIco/>
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`relative flex-1 ${isEnterprise ? 'lg:px-0' : 'pb-8'}`}>
        {/* HERO AREA */}
        <section className={`relative px-5 pt-3 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto lg:pt-8' : ''}`}>
          <div className="relative grid grid-cols-[1fr_140px] lg:grid-cols-[1fr_240px] gap-6 items-center">
            <div className="min-w-0">
              <p className="text-[10.5px] lg:text-[12px] font-bold tracking-[0.22em] uppercase" style={{ color: brand }}>Módulo 2</p>
              <h2 className="mt-1.5 text-[26px] lg:text-[42px] leading-[1.05] text-[#111]" style={{ ...serif, fontWeight: 600 }}>
                Pensamentos acelerados
              </h2>
              <div className="mt-3 text-[12px] lg:text-[14px]" style={{ color: ink500 }}>
                Materiais complementares desta trilha.
              </div>
            </div>
            <div className="relative w-full aspect-video lg:aspect-square rounded-[24px] overflow-hidden ring-1 ring-black/5" style={{ boxShadow:"0 12px 32px -12px rgba(17,17,17,0.2)" }}>
              <img src={heroImg} alt="" width={1024} height={768} className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>
        </section>

        {/* SECTION HEADER */}
        <section className={`px-5 mt-8 lg:mt-12 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto' : ''}`}>
          <div
            className={`rounded-[24px] lg:rounded-[32px] p-4 lg:p-6 flex items-center gap-4 lg:gap-6 ${isEnterprise ? 'bg-white border border-black/5' : ''}`}
            style={!isEnterprise ? {
              background: "rgba(255,255,255,0.78)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
              boxShadow: "0 6px 22px -16px rgba(17,17,17,0.10), inset 0 0 0 1px rgba(17,17,17,0.05)",
            } : {}}
          >
            <span className="w-12 h-12 lg:w-16 lg:h-16 rounded-2xl lg:rounded-3xl flex items-center justify-center shrink-0" style={{ background: "#FFEFD9", boxShadow: "inset 0 0 0 1px rgba(248,138,43,0.2)" }}>
              <BookIco />
            </span>
            <div className="min-w-0">
              <h3 className="text-[20px] lg:text-[28px] leading-tight text-[#111]" style={{ ...serif, fontWeight: 600 }}>Materiais Complementares</h3>
              <p className="mt-1 text-[12px] lg:text-[15px]" style={{ color: ink600 }}>Práticas e conteúdos para aprofundar sua evolução de forma prática.</p>
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className={`px-5 mt-6 flex flex-col gap-4 lg:gap-6 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
            {materiais.map((m, i) => (
              <div key={i} className="lg:hover:translate-y-[-4px] transition-transform duration-300">
                <MatCard m={m} />
              </div>
            ))}
          </div>
        </section>

        {/* RECOMENDADO */}
        <section className={`px-5 mt-10 lg:mt-16 mb-20 ${isEnterprise ? 'lg:max-w-4xl lg:mx-auto' : ''}`}>
          <div
            className="relative rounded-[28px] lg:rounded-[40px] p-6 lg:p-10 pl-20 lg:pl-32 pr-24 overflow-hidden"
            style={{
              background: "linear-gradient(135deg, #FFF8F1 0%, #FBE9D5 100%)",
              boxShadow: "0 12px 40px -20px rgba(248,138,43,0.3), inset 0 0 0 1px rgba(248,138,43,0.14)",
            }}
          >
            <span className="absolute left-6 lg:left-10 top-6 lg:top-10 w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-white flex items-center justify-center shadow-sm" style={{ boxShadow: "inset 0 0 0 1px rgba(248,138,43,0.25)" }}>
              <Star />
            </span>
            <p className="text-[11px] lg:text-[13px] font-bold uppercase tracking-[0.25em]" style={{ color: brand }}>Recomendado para você</p>
            <p className="mt-3 text-[14px] lg:text-[20px] lg:leading-relaxed text-[#111] max-w-2xl" style={{ ...serif, fontWeight: 500 }}>
              Dedique alguns minutos por dia a essas práticas. Pequenas ações constantes geram transformações profundas na sua saúde emocional.
            </p>
            <svg className="absolute right-4 bottom-2 opacity-40 lg:w-[120px] lg:h-[90px]" width="78" height="58" viewBox="0 0 80 60" fill="none" stroke="#D8A878" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path d="M70 50 Q40 30 14 14"/>
              <path d="M40 30 q4 -10 -6 -14"/>
              <path d="M52 38 q4 -10 -6 -14"/>
              <path d="M28 22 q4 -10 -6 -14"/>
              <ellipse cx="60" cy="50" rx="18" ry="6" />
            </svg>
          </div>
        </section>
      </div>
    </div>
  );

  return (
    <Layout>
      {isEnterprise ? (
        <MediaDesktopLayout 
          title="Materiais Complementares" 
          backTo="/enterprise/aula"
          sidePanel={
            <div className="space-y-6">
              <SidePanelCard title="Download Rápido">
                <button className="w-full flex items-center justify-between p-4 rounded-2xl bg-[#F88A2B] text-white font-bold text-sm hover:bg-[#F88A2B]/90 transition-colors">
                  <span>Baixar todos os materiais</span>
                  <DownloadIco c="white" s={18} />
                </button>
              </SidePanelCard>
              <SidePanelCard title="Dica do Expert">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#FFEFD9] flex items-center justify-center shrink-0">
                    <Sprig />
                  </div>
                  <p className="text-[13px] leading-relaxed text-[#555] font-medium italic">
                    "O aprendizado só se torna sabedoria quando colocado em prática. Use estes materiais como bússola para sua jornada."
                  </p>
                </div>
              </SidePanelCard>
            </div>
          }
        >
          {content}
        </MediaDesktopLayout>
      ) : (
        content
      )}
    </Layout>
  );
};

export default MateriaisScreen;
