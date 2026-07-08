import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Database, 
  Clock, 
  History, 
  ChevronRight, 
  Lock, 
  EyeOff, 
  CheckCircle2, 
  Calendar,
  AlertCircle,
  ShieldAlert,
  Trash2,
  FileText,
  MessageSquare,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseDataRetentionScreen = () => {
  const navigate = useNavigate();
  
  const [retentionPolicies, setRetentionPolicies] = useState({
    logs: "12 meses",
    reports: "24 meses",
    exports: "90 dias",
    onboarding: "12 meses",
    historical: "24 meses",
    canalDireto: "Configuração separada"
  });

  const kpis = [
    { label: "Logs administrativos", value: "12 meses", icon: Clock },
    { label: "Indicadores agregados", value: "24 meses", icon: Database },
    { label: "Exportações", value: "90 dias", icon: FileText },
    { label: "Canal Direto RH", value: "Separado", icon: MessageSquare },
  ];

  const policyCards = [
    {
      id: "logs",
      title: "Logs administrativos",
      desc: "Registros de acessos, permissões, exportações e alterações.",
      options: ["6 meses", "12 meses", "24 meses"]
    },
    {
      id: "reports",
      title: "Relatórios agregados",
      desc: "Relatórios executivos sem dados individuais.",
      options: ["12 meses", "24 meses", "36 meses"]
    },
    {
      id: "exports",
      title: "Exportações",
      desc: "Arquivos PDF, CSV agregado e board reports.",
      options: ["30 dias", "90 dias", "180 dias"]
    },
    {
      id: "onboarding",
      title: "Convites e onboarding",
      desc: "Histórico administrativo de convites enviados e ativação de contas.",
      options: ["6 meses", "12 meses", "24 meses"]
    },
    {
      id: "historical",
      title: "Dados agregados históricos",
      desc: "Tendências organizacionais sem identificação individual.",
      options: ["12 meses", "24 meses", "36 meses"]
    }
  ];

  const handleRetentionChange = (id: string, value: string) => {
    setRetentionPolicies(prev => ({ ...prev, [id]: value }));
    toast.success(`${value} definido para ${id.charAt(0).toUpperCase() + id.slice(1)}`);
  };

  const executeCleanup = () => {
    toast.info("Rotina de retenção simulada com segurança.", {
      description: "Arquivos e logs vencidos foram processados."
    });
  };

  const savePolicies = () => {
    toast.success("Políticas de retenção atualizadas.", {
      description: "As novas regras entrarão em vigor no próximo ciclo."
    });
  };

  return (
    <EnterpriseRHLayout title="Retenção de dados">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] font-['Montserrat'] text-[#0B0908] overflow-y-auto pb-32">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-[#F7F4F2]/80 backdrop-blur-md z-40">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#0B0908]">Retenção de dados</h1>
        <div className="bg-[#F88A2B]/10 text-[#F88A2B] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
          Governança
        </div>
      </header>

      <main className="px-6 max-w-5xl mx-auto space-y-8">
        {/* Hero Card */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/10 blur-[100px] rounded-full -mr-40 -mt-40 transition-opacity group-hover:opacity-80"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-[#F88A2B]">
              <div className="w-10 h-10 rounded-full bg-[#F88A2B]/20 flex items-center justify-center">
                <Database className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Tratamento responsável</span>
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-['Playfair_Display'] leading-tight">
                Dados emocionais exigem responsabilidade desde a origem até o descarte.
              </h2>
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
                Configure períodos de retenção para registros administrativos, relatórios agregados e exportações protegidas.
              </p>
            </div>
            
            <div className="pt-4 flex items-center gap-6">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Privacidade ativa</span>
              </div>
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-300">Segurança total</span>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 right-0 opacity-5 pointer-events-none">
            <Sparkles className="w-64 h-64 -mb-16 -mr-16" />
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-all group">
              <div className="w-10 h-10 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center text-[#F88A2B] mb-4 group-hover:scale-110 transition-transform">
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B0908]">{kpi.value}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider leading-tight">{kpi.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Políticas de retenção */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Políticas de retenção</h3>
            <span className="text-[10px] text-zinc-400 font-medium">Última revisão: Abril 2026</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {policyCards.map((card) => (
              <div key={card.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col justify-between hover:border-[#F88A2B]/20 transition-all group">
                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-[#0B0908]">{card.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#F88A2B]/10 text-[#F88A2B] uppercase">
                      Ativo
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{card.desc}</p>
                </div>
                
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Período de retenção</span>
                  <div className="flex flex-wrap gap-2">
                    {card.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleRetentionChange(card.id, option)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          retentionPolicies[card.id as keyof typeof retentionPolicies] === option
                            ? "bg-[#0B0908] text-white"
                            : "bg-zinc-50 text-zinc-400 hover:bg-zinc-100"
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {/* Canal Direto RH Card */}
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col justify-between hover:border-[#F88A2B]/20 transition-all">
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-[#0B0908]">Canal Direto RH</h4>
                  <MessageSquare className="w-4 h-4 text-zinc-300" />
                </div>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  Mensagens confidenciais seguem política separada da empresa para garantir proteção ética.
                </p>
              </div>
              
              <button 
                onClick={() => navigate('/enterprise/rh/politicas/canal-direto')}
                className="w-full bg-[#0B0908] text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
              >
                Ver política do Canal Direto <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* O que nunca é retido */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden group">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#F88A2B]/5 blur-[80px] rounded-full translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 space-y-8">
            <div className="flex items-center justify-between">
              <h3 className="text-xl md:text-2xl font-['Playfair_Display']">Experiências individuais permanecem fora da retenção administrativa.</h3>
              <div className="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Privacidade preservada</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-12">
              {[
                "Respostas emocionais individuais",
                "Conversas privadas com IA",
                "Score emocional pessoal",
                "Trilha emocional individual",
                "Histórico privado do colaborador"
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F88A2B]" />
                  <span className="text-sm text-zinc-400">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Exclusão programada */}
        <section className="bg-white/40 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B]">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Próxima limpeza automática</h3>
              <p className="text-xs text-zinc-500">30 de Junho de 2026</p>
            </div>
          </div>

          <div className="space-y-3">
            {[
              "Exportações antigas serão removidas",
              "Logs vencidos serão arquivados",
              "Relatórios agregados serão preservados conforme política"
            ].map((text, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span className="text-xs text-zinc-600 font-medium">{text}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={executeCleanup}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] hover:opacity-80 transition-opacity"
          >
            <Trash2 className="w-3 h-3" /> Executar limpeza mockada
          </button>
        </section>

        {/* Histórico de retenção */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Histórico de retenção</h3>
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-6">
            {[
              { title: "Política de exportações atualizada", date: "Há 2 dias", icon: FileText },
              { title: "Logs administrativos arquivados", date: "Há 1 semana", icon: History },
              { title: "Relatórios antigos preservados", date: "Há 1 mês", icon: Database },
              { title: "Retenção do Canal Direto revisada", date: "Há 2 meses", icon: MessageSquare }
            ].map((item, idx) => (
              <div key={idx} className="flex gap-4 relative">
                {idx !== 3 && <div className="absolute left-[11px] top-8 w-[1px] h-10 bg-zinc-100" />}
                <div className="w-6 h-6 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300 relative z-10">
                  <item.icon className="w-3 h-3" />
                </div>
                <div className="space-y-0.5">
                  <p className="text-xs font-bold text-[#0B0908]">{item.title}</p>
                  <p className="text-[10px] text-zinc-400">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Conformidade */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-6">
          <div className="flex items-center gap-4 text-[#F88A2B]">
            <ShieldCheck className="w-6 h-6" />
            <p className="text-sm font-medium text-zinc-700 leading-relaxed">
              As regras de retenção ajudam a manter equilíbrio entre memória organizacional, privacidade e governança.
            </p>
          </div>
          <button 
            onClick={() => navigate('/enterprise/rh/compliance')}
            className="bg-zinc-100 text-[#0B0908] px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            Voltar ao compliance <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* Leitura ética */}
        <section className="bg-[#0B0908] rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden group text-center">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F88A2B]/5 blur-[120px] rounded-full"></div>
          <div className="relative z-10 space-y-6 max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-['Playfair_Display'] italic">
              "Guardar menos também pode ser uma forma de proteger."
            </h2>
            <p className="text-zinc-400 text-sm md:text-base leading-relaxed">
              O Enterprise deve preservar apenas o necessário para inteligência organizacional, governança e continuidade do cuidado coletivo.
            </p>
          </div>
        </section>

        {/* Action Buttons */}
        <div className="flex flex-col gap-4 pt-8">
          <button 
            onClick={savePolicies}
            className="w-full bg-[#F88A2B] text-white py-5 rounded-3xl font-bold text-sm shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all hover:bg-[#e07a20]"
          >
            Salvar políticas de retenção
          </button>
          <button 
            onClick={() => navigate('/enterprise/rh/consentimentos')}
            className="w-full bg-transparent text-zinc-400 py-5 rounded-3xl font-bold text-sm active:scale-[0.98] transition-all hover:text-[#0B0908]"
          >
            Voltar aos consentimentos
          </button>
        </div>

        <footer className="pt-8 pb-12 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[320px] mx-auto">
            Retenção responsável protege a organização e preserva a confiança emocional dos colaboradores.
          </p>
        </footer>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseDataRetentionScreen;