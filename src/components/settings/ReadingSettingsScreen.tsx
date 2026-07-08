import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ChevronLeft, Check, Type, AlignLeft, Sun, Moon, 
  Smartphone, Monitor, Sparkles, BookOpen, Settings2
} from "lucide-react";
import { AppUserLayout } from "../layouts/AppUserLayout";
import { EnterpriseUserLayout } from "../layouts/EnterpriseUserLayout";
import { motion } from "framer-motion";

const serif = { fontFamily: "'Playfair Display', serif" };

const ReadingSettingsScreen = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isEnterprise = pathname.startsWith('/enterprise');

  const [fontSize, setFontSize] = useState(() => localStorage.getItem("mc-font-size") || "medium");
  const [fontFamily, setFontFamily] = useState(() => localStorage.getItem("mc-font-family") || "sans");
  const [lineHeight, setLineHeight] = useState(() => localStorage.getItem("mc-line-height") || "normal");

  const save = (key: string, val: string, setter: (v: string) => void) => {
    setter(val);
    localStorage.setItem(key, val);
  };

  const OptionCard = ({ 
    label, 
    active, 
    onClick, 
    preview 
  }: { 
    label: string; 
    active: boolean; 
    onClick: () => void;
    preview?: React.ReactNode;
  }) => (
    <button 
      onClick={onClick}
      className={`flex flex-col p-4 rounded-2xl border transition-all ${
        active 
          ? "border-[#F88A2B] bg-orange-50/30 ring-1 ring-[#F88A2B]/20" 
          : "border-black/5 bg-[#F9F8F6] hover:bg-black/5"
      }`}
    >
      <div className="flex items-center justify-between mb-3 w-full">
        <span className={`text-xs font-bold ${active ? "text-[#F88A2B]" : "text-[#111]"}`}>{label}</span>
        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${active ? "bg-[#F88A2B] border-[#F88A2B]" : "border-black/10"}`}>
          {active && <Check size={10} className="text-white" strokeWidth={4} />}
        </div>
      </div>
      {preview && (
        <div className="w-full bg-white rounded-xl p-3 shadow-sm flex items-center justify-center">
          {preview}
        </div>
      )}
    </button>
  );

  const PreviewBox = () => (
    <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 relative overflow-hidden group">
      <div className="absolute top-4 right-4 text-[#F88A2B]/20 group-hover:text-[#F88A2B]/40 transition-colors">
        <Sparkles size={24} />
      </div>
      <p className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-[0.2em] mb-6">Prévia da Leitura</p>
      <h3 style={serif} className="text-2xl font-bold text-[#111] mb-4">A arte de silenciar a mente</h3>
      <div 
        className={`text-[#444] transition-all duration-300 ${
          fontFamily === 'serif' ? 'font-serif' : 'font-sans'
        } ${
          fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-xl' : 'text-base'
        } ${
          lineHeight === 'tight' ? 'leading-tight' : lineHeight === 'loose' ? 'leading-loose' : 'leading-relaxed'
        }`}
      >
        Educar é ser um artesão da inteligência. Não é apenas despejar informações, mas ajudar o outro a pensar, a gerir seus próprios pensamentos e a proteger sua emoção. Quando silenciamos o ruído externo, começamos a ouvir a melodia interna.
      </div>
    </div>
  );

  if (isEnterprise) {
    return (
      <EnterpriseUserLayout title="Acessibilidade de Leitura">
        <div className="max-w-6xl mx-auto space-y-10 pb-24">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <h1 style={serif} className="text-4xl lg:text-5xl font-bold text-[#111]">Acessibilidade</h1>
              <p className="text-base text-[#8A8A8A] font-medium">Ajuste o texto para o seu conforto visual.</p>
            </div>
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-white border border-black/5 rounded-2xl text-xs font-bold text-[#111] hover:bg-black/5 transition-all flex items-center gap-2"
            >
              <ChevronLeft size={16} /> Voltar
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            
            <div className="space-y-8">
              {/* Font Family */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h3 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
                  <Type size={18} className="text-[#F88A2B]" /> Família de Fonte
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <OptionCard 
                    label="Sem Serifa (Sans)" 
                    active={fontFamily === 'sans'} 
                    onClick={() => save("mc-font-family", "sans", setFontFamily)}
                    preview={<span className="font-sans text-lg">Aa</span>}
                  />
                  <OptionCard 
                    label="Com Serifa (Serif)" 
                    active={fontFamily === 'serif'} 
                    onClick={() => save("mc-font-family", "serif", setFontFamily)}
                    preview={<span className="font-serif text-lg">Aa</span>}
                  />
                </div>
              </div>

              {/* Font Size */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h3 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
                  <AlignLeft size={18} className="text-[#9B8AC9]" /> Tamanho do Texto
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <OptionCard 
                    label="Pequeno" 
                    active={fontSize === 'small'} 
                    onClick={() => save("mc-font-size", "small", setFontSize)}
                    preview={<span className="text-xs">Texto</span>}
                  />
                  <OptionCard 
                    label="Médio" 
                    active={fontSize === 'medium'} 
                    onClick={() => save("mc-font-size", "medium", setFontSize)}
                    preview={<span className="text-base">Texto</span>}
                  />
                  <OptionCard 
                    label="Grande" 
                    active={fontSize === 'large'} 
                    onClick={() => save("mc-font-size", "large", setFontSize)}
                    preview={<span className="text-xl">Texto</span>}
                  />
                </div>
              </div>

              {/* Line Height */}
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5">
                <h3 className="text-lg font-bold text-[#111] mb-6 flex items-center gap-2">
                  <Settings2 size={18} className="text-[#8FB17D]" /> Espaçamento (Linhas)
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  <OptionCard 
                    label="Compacto" 
                    active={lineHeight === 'tight'} 
                    onClick={() => save("mc-line-height", "tight", setLineHeight)}
                  />
                  <OptionCard 
                    label="Padrão" 
                    active={lineHeight === 'normal'} 
                    onClick={() => save("mc-line-height", "normal", setLineHeight)}
                  />
                  <OptionCard 
                    label="Amplo" 
                    active={lineHeight === 'loose'} 
                    onClick={() => save("mc-line-height", "loose", setLineHeight)}
                  />
                </div>
              </div>
            </div>

            {/* Sticky Preview */}
            <div className="lg:sticky lg:top-10 h-fit space-y-6">
              <PreviewBox />
              <div className="bg-gradient-to-br from-[#111] to-[#222] rounded-[32px] p-8 text-white shadow-xl relative overflow-hidden">
                <Monitor className="absolute -top-6 -right-6 w-32 h-32 text-white/5 rotate-12" />
                <div className="relative z-10">
                  <h3 className="text-xl font-bold mb-3 font-playfair">Foco na Experiência</h3>
                  <p className="text-xs text-white/50 leading-relaxed">As preferências de leitura são salvas na sua conta e aplicadas automaticamente em todos os seus dispositivos corporativos.</p>
                </div>
              </div>
            </div>

          </div>

          <div className="text-center pt-10">
            <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Enterprise RH · Acessibilidade Visual · v1.2.0</p>
          </div>
        </div>
      </EnterpriseUserLayout>
    );
  }

  // Mobile Layout
  return (
    <AppUserLayout>
      <main className="h-screen min-h-[100dvh] bg-[#F7F4F2] flex flex-col font-display">
        <div className="px-5 pt-8 pb-4 shrink-0 flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm border border-black/5 active:scale-95 transition-all">
             <ChevronLeft size={20} className="text-[#111]" />
           </button>
           <h1 style={serif} className="text-xl font-bold text-[#111]">Leitura</h1>
           <div className="w-10" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-10 space-y-6 no-scrollbar">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
             <h3 className="text-sm font-bold text-[#111] mb-4 flex items-center gap-2">
                <Type size={16} className="text-[#F88A2B]" /> Fonte
             </h3>
             <div className="grid grid-cols-2 gap-3">
                <OptionCard 
                  label="Sans" 
                  active={fontFamily === 'sans'} 
                  onClick={() => save("mc-font-family", "sans", setFontFamily)}
                />
                <OptionCard 
                  label="Serif" 
                  active={fontFamily === 'serif'} 
                  onClick={() => save("mc-font-family", "serif", setFontFamily)}
                />
             </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-black/5">
             <h3 className="text-sm font-bold text-[#111] mb-4 flex items-center gap-2">
                <AlignLeft size={16} className="text-[#9B8AC9]" /> Tamanho
             </h3>
             <div className="grid grid-cols-3 gap-2">
                <OptionCard label="P" active={fontSize === 'small'} onClick={() => save("mc-font-size", "small", setFontSize)} />
                <OptionCard label="M" active={fontSize === 'medium'} onClick={() => save("mc-font-size", "medium", setFontSize)} />
                <OptionCard label="G" active={fontSize === 'large'} onClick={() => save("mc-font-size", "large", setFontSize)} />
             </div>
          </div>

          <PreviewBox />
        </div>
      </main>
    </AppUserLayout>
  );
};

export default ReadingSettingsScreen;