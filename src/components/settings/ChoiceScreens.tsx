import { useState } from "react";
import { Check } from "lucide-react";
import { Phone, SubHeader, card } from "./Phone";
import BottomNav from "../BottomNav";
import { AppUserLayout } from "../layouts/AppUserLayout";

type Props = { title: string; storageKey: string; options: { id: string; label: string; desc?: string }[]; defaultId: string };

const ChoiceList = ({ title, storageKey, options, defaultId }: Props) => {
  const initial = (typeof window !== "undefined" && localStorage.getItem(storageKey)) || defaultId;
  const [sel, setSel] = useState<string>(initial);
  const pick = (id: string) => { setSel(id); localStorage.setItem(storageKey, id); };

  return (
    <AppUserLayout>
      <Phone>
        <SubHeader title={title} />
        <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
          <div className={`${card} mt-4 divide-y divide-[#F0EAE3]`}>
            {options.map((o) => (
              <button key={o.id} onClick={() => pick(o.id)}
                className="w-full flex items-center gap-3 py-4 text-left active:bg-black/[0.02] transition-colors">
                <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${sel === o.id ? "border-[#F88A2B] bg-[#F88A2B]" : "border-[#D9CFC4] bg-white"}`}>
                  {sel === o.id && <Check size={12} className="text-white" strokeWidth={3} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-semibold text-[#111] leading-tight">{o.label}</p>
                  {o.desc && <p className="text-[11.5px] text-[#8A8A8A] mt-0.5">{o.desc}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
        <BottomNav />
      </Phone>
    </AppUserLayout>
  );
};

export const LanguageScreen = () => (
  <ChoiceList title="Idioma" storageKey="mc-lang" defaultId="pt"
    options={[
      { id: "pt", label: "Português", desc: "Brasil" },
      { id: "en", label: "English", desc: "United States" },
      { id: "es", label: "Español", desc: "España" },
    ]} />
);

export const VideoQualityScreen = () => (
  <ChoiceList title="Qualidade do vídeo" storageKey="mc-quality" defaultId="auto"
    options={[
      { id: "auto", label: "Auto", desc: "Ajusta conforme sua conexão" },
      { id: "high", label: "Alta", desc: "1080p · maior consumo de dados" },
      { id: "medium", label: "Média", desc: "720p · equilíbrio recomendado" },
      { id: "low", label: "Baixa", desc: "480p · economiza dados" },
    ]} />
);
