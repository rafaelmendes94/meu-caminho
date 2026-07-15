import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  EyeOff, 
  Eye, 
  Lock, 
  Bot, 
  MessageSquareOff, 
  FileCheck, 
  FileText, 
  ShieldAlert,
  ChevronRight,
  Info,
  ArrowLeft
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

const EnterprisePrivacyCenterScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { organization, hasAnyRole } = useAuth();
  const isRH = location.pathname.startsWith('/enterprise/rh');
  const Layout = isRH ? EnterpriseRHLayout : EnterpriseUserLayout;
  const canEdit = hasAnyRole(["owner", "rh_admin"]);
  const [minGroup, setMinGroup] = useState<number>(5);
  const [savingMin, setSavingMin] = useState(false);

  useEffect(() => {
    if (!organization?.id) return;
    (async () => {
      const { data } = await supabase
        .from("organization_settings")
        .select("value")
        .eq("organization_id", organization.id)
        .eq("key", "privacy_min_group_size")
        .maybeSingle();
      const v = (data as any)?.value;
      const parsed = Number(v?.value ?? v ?? 5);
      if (!Number.isNaN(parsed)) setMinGroup(parsed);
    })();
  }, [organization?.id]);

  const saveMinGroup = async (next: number) => {
    if (!organization?.id || !canEdit) return;
    setSavingMin(true);
    const { error } = await supabase
      .from("organization_settings")
      .upsert(
        { organization_id: organization.id, key: "privacy_min_group_size", value: { value: next } as any },
        { onConflict: "organization_id,key" }
      );
    setSavingMin(false);
    if (error) toast.error("Não foi possível salvar o mínimo de grupo.");
    else { setMinGroup(next); toast.success(`Mínimo de anonimato definido como ${next}.`); }
  };

  const whatNeverShows = [
    "Respostas individuais do check-in",
    "Conversas privadas com a IA",
    "Resultado emocional pessoal",
    "Trilha individual do colaborador",
    "Histórico emocional individual",
    "Mensagens do Canal Direto em dashboards"
  ];

  const whatRHCanSee = [
    "Tendências emocionais coletivas",
    "Adesão geral ao check-in",
    "Temas recorrentes agregados",
    "Alertas por área com volume mínimo",
    "Evolução emocional coletiva",
    "Relatórios executivos sem identificação"
  ];

  const exportItems = [
    { title: "PDF executivo sem dados individuais", icon: <FileText className="w-5 h-5 text-[#F88A2B]" /> },
    { title: "CSV apenas agregado", icon: <FileCheck className="w-5 h-5 text-[#F88A2B]" /> },
    { title: "Apresentações sem nomes", icon: <FileText className="w-5 h-5 text-[#F88A2B]" /> },
    { title: "Relatórios sem conversas privadas", icon: <FileCheck className="w-5 h-5 text-[#F88A2B]" /> },
    { title: "Logs administrativos sem conteúdo emocional", icon: <Lock className="w-5 h-5 text-[#F88A2B]" /> },
  ];

  return (
    <Layout title="Privacidade Enterprise">
      <div className="animate-fade-in space-y-8 lg:space-y-12">
        
        {/* Header Section */}
        <header className="relative z-20 flex items-center justify-between lg:hidden mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-sm border border-black/5 text-[#111] active:scale-90 transition-transform"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#999]">Segurança</span>
            <span className="text-[13px] font-bold text-[#F88A2B]">Privacidade</span>
          </div>
          <div className="w-10" />
        </header>

        {/* Hero Card */}
        <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[32px] p-8 lg:p-12 relative overflow-hidden shadow-sm flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#F88A2B]/05 blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#F88A2B]/03 blur-[80px]" />
          
          <div className="relative z-10 space-y-6 text-left max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-[#333] text-[11px] font-bold uppercase tracking-[0.2em] backdrop-blur-sm">
              <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
              Agregado e anônimo por padrão
            </div>
            
            <h2 className="text-4xl lg:text-5xl font-bold text-[#111] leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
              Privacidade não é uma camada. <br />
              <span className="text-[#F88A2B]">É a fundação do sistema.</span>
            </h2>
            
            <p className="text-[#444] text-lg leading-relaxed max-w-xl font-medium">
              O RH enxerga sinais coletivos e tendências de saúde emocional da empresa, mas sua jornada individual permanece 100% privada e inacessível.
            </p>
          </div>
          
          <div className="hidden lg:block relative z-10 shrink-0">
            <div className="bg-black/[0.03] backdrop-blur-xl border border-black/5 p-8 rounded-[32px] w-[320px] shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                    <div className="h-12 w-12 rounded-2xl bg-[#F88A2B]/20 flex items-center justify-center">
                        <Lock className="h-6 w-6 text-[#F88A2B]" />
                    </div>
                    <p className="text-[#111] font-bold">Criptografia Ativa</p>
                </div>
                <div className="space-y-4">
                    <div className="h-1 w-full bg-black/5 rounded-full overflow-hidden">
                        <div className="h-full bg-[#F88A2B] w-full" />
                    </div>
                    <p className="text-[#999] text-[10px] font-bold uppercase tracking-widest">Segurança de Dados</p>
                </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* What Never Shows */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-2">
                <EyeOff className="w-4 h-4" />
                O que nunca aparece para o RH
              </h3>
            </div>
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 space-y-5 h-full">
              {whatNeverShows.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-1">
                  <div className="w-6 h-6 rounded-full bg-[#F88A2B08] flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#F88A2B]" />
                  </div>
                  <span className="text-[15px] font-bold text-[#444]">{item}</span>
                </div>
              ))}
            </div>
          </section>

          {/* What RH Can See */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[12px] font-bold text-[#999] uppercase tracking-wider flex items-center gap-2">
                <Eye className="w-4 h-4" />
                O que o RH pode visualizar
              </h3>
            </div>
            <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 space-y-5 h-full">
              {whatRHCanSee.map((item, index) => (
                <div key={index} className="flex items-center gap-4 py-1">
                  <div className="w-6 h-6 rounded-full bg-black/5 flex items-center justify-center shrink-0">
                    <ChevronRight className="w-3.5 h-3.5 text-[#999]" />
                  </div>
                  <span className="text-[15px] font-bold text-[#444]">{item}</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Minimum Volume & AI Privacy - Desktop Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Minimum Volume Protection */}
            <section className="space-y-6">
              <div className="bg-white/60 backdrop-blur-md rounded-[32px] p-8 border border-white shadow-sm space-y-6 h-full flex flex-col justify-center">
                <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Grupos pequenos protegidos.
                    </h3>
                    <p className="text-[16px] text-[#666] leading-relaxed font-medium">
                    Recortes por área ou setor só aparecem quando há um número mínimo de colaboradores participando, impedindo qualquer tentativa de identificação.
                    </p>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-white rounded-[24px] border border-black/5 shadow-sm">
                  <div className="flex flex-col">
                    <span className="text-[11px] text-[#999] uppercase font-bold tracking-wider mb-1">Regra de anonimato</span>
                    <span className="text-xl font-bold text-[#111]">Mínimo {minGroup} por grupo</span>
                    {canEdit && (
                      <div className="flex items-center gap-2 mt-3">
                        {[3, 5, 8, 10].map((n) => (
                          <button
                            key={n}
                            onClick={() => saveMinGroup(n)}
                            disabled={savingMin}
                            className={`h-8 px-3 rounded-full text-[11px] font-bold border transition-all ${minGroup === n ? "bg-[#F88A2B] text-white border-[#F88A2B]" : "bg-white text-[#666] border-black/10 hover:border-[#F88A2B]/40"}`}
                          >
                            {n}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-[#F88A2B08] flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-[#F88A2B]" />
                  </div>
                </div>
              </div>
            </section>

            {/* AI Privacy */}
            <section className="space-y-6">
              <div className="bg-white rounded-[32px] p-8 shadow-sm border border-black/5 space-y-8 h-full">
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-[#111] flex items-center gap-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    <Bot className="w-8 h-8 text-[#F88A2B]" />
                    IA de Padrões
                  </h3>
                  <p className="text-[15px] text-[#666] leading-relaxed font-medium">
                    Nossa IA interpreta temas recorrentes de forma coletiva, transformando diálogos em insights para a cultura da empresa sem nunca expor frases individuais.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-[#F88A2B05] rounded-2xl border border-[#F88A2B05]">
                    <MessageSquareOff className="w-5 h-5 text-[#F88A2B] mb-2" />
                    <p className="text-[10px] font-bold text-[#111] uppercase tracking-tighter">Zero acesso a chats</p>
                  </div>
                  <div className="p-4 bg-[#F88A2B05] rounded-2xl border border-[#F88A2B05]">
                    <Bot className="w-5 h-5 text-[#F88A2B] mb-2" />
                    <p className="text-[10px] font-bold text-[#111] uppercase tracking-tighter">Insights Coletivos</p>
                  </div>
                </div>
              </div>
            </section>
        </div>

        {/* Direct Channel RH */}
        <section>
          <div className="bg-white border border-[#E5E0DA] text-[#111] rounded-[32px] p-8 lg:p-10 text-[#111] relative overflow-hidden shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/05 blur-[80px]" />
            
            <div className="relative z-10 space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F88A2B]/20 border border-[#F88A2B]/30 text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">
                <ShieldAlert className="w-3 h-3" />
                Fluxo Sensível Separado
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
                Situações sensíveis nunca viram estatística.
              </h3>
              <p className="text-[#666] text-[15px] font-medium leading-relaxed">
                Assuntos como assédio ou ambiente tóxico tratados no Canal Direto RH seguem um fluxo de proteção específico. Eles não são agregados em gráficos ou dashboards coletivos de saúde emocional.
              </p>
            </div>
            
            {!isRH && (
              <button 
                  onClick={() => navigate('/enterprise/sos-rh')}
                  className="relative z-10 h-14 px-8 rounded-full bg-white text-[#0B0908] font-bold text-[14px] transition-all hover:bg-[#F88A2B] hover:text-[#111] shrink-0 shadow-lg shadow-black/20"
              >
                  Acessar Canal Direto
              </button>
            )}
          </div>
        </section>

        {/* Ethical Footer */}
        <section className="pt-8 pb-12">
          <div className="bg-white/40 backdrop-blur-sm border border-white rounded-[32px] p-12 text-center space-y-8 relative overflow-hidden shadow-sm">
            <div className="relative z-10 max-w-4xl mx-auto space-y-6">
              <p className="text-2xl lg:text-3xl font-medium italic text-[#111] leading-relaxed" style={{ fontFamily: "'Playfair Display', serif" }}>
                “O cuidado coletivo não pode virar vigilância individual.”
              </p>
              <div className="flex flex-col items-center gap-3">
                <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#F88A2B]" />
                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Enterprise Privacy Standard</span>
                </div>
                <div className="w-12 h-0.5 bg-[#F88A2B]/20 rounded-full" />
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
};

export default EnterprisePrivacyCenterScreen;
