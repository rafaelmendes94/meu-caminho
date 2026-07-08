import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  ShieldCheck, 
  Lock, 
  EyeOff, 
  FileCheck, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  History, 
  Database, 
  ClipboardCheck, 
  ChevronRight,
  ShieldAlert,
  Fingerprint,
  Users,
  MessageSquare,
  FileText,
  Download,
  Settings
} from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseComplianceScreen = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: "Políticas críticas ativas", value: "100%", icon: ShieldCheck },
    { label: "Consentimentos registrados", value: "98%", icon: ClipboardCheck },
    { label: "Riscos críticos abertos", value: "0", icon: ShieldAlert },
    { label: "Auditorias administrativas", value: "12", icon: Fingerprint },
  ];

  const complianceStatus = [
    {
      title: "Privacidade individual",
      desc: "Respostas, conversas e resultados individuais permanecem privados.",
      status: "Conforme",
      icon: Lock
    },
    {
      title: "Anonimização automática",
      desc: "Indicadores aparecem apenas de forma coletiva e agregada.",
      status: "Conforme",
      icon: EyeOff
    },
    {
      title: "Canal Direto RH",
      desc: "Relatos sensíveis seguem fluxo separado dos dashboards.",
      status: "Conforme",
      icon: MessageSquare
    },
    {
      title: "Exportações",
      desc: "Arquivos não incluem dados individuais.",
      status: "Conforme",
      icon: Download
    }
  ];

  const activeControls = [
    "bloqueio de grupos pequenos",
    "IA agregada por padrão",
    "consentimento obrigatório",
    "logs administrativos",
    "exportações protegidas",
    "retenção de dados configurada",
    "SSO disponível",
    "domínio corporativo autorizado"
  ];

  return (
    <EnterpriseRHLayout title="Compliance">
    <div className="min-h-screen min-h-[100dvh] bg-white font-['Montserrat'] text-[#0B0908] overflow-y-auto pb-32">
      {/* Header */}
      <header className="p-6 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-40">
        <button 
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white shadow-sm hover:bg-zinc-50 transition-colors border border-zinc-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-[#0B0908]">Compliance Enterprise</h1>
        <div className="bg-[#F88A2B]/10 text-[#F88A2B] px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase">
          Conformidade
        </div>
      </header>

      <main className="px-6 max-w-5xl mx-auto space-y-8">
        {/* Hero Card */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 text-[#0B0908] relative overflow-hidden shadow-sm border border-zinc-100 group">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/5 blur-[100px] rounded-full -mr-40 -mt-40 transition-opacity group-hover:opacity-80"></div>
          <div className="absolute bottom-0 left-0 w-full h-1/2 opacity-[0.03]">
            <svg viewBox="0 0 1000 100" className="w-full h-full preserve-3d">
              <path d="M0,50 Q250,0 500,50 T1000,50" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </svg>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3 text-[#F88A2B]">
              <div className="w-10 h-10 rounded-full bg-[#F88A2B]/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-xs font-bold uppercase tracking-[0.3em]">Compliance ativo</span>
            </div>
            
            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-['Playfair_Display'] leading-tight text-[#0B0908]">
                Governança emocional exige confiança verificável.
              </h2>
              <p className="text-zinc-500 text-sm md:text-base leading-relaxed">
                Acompanhe políticas, consentimentos, auditoria e proteção de dados em uma visão clara e executiva.
              </p>
            </div>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex flex-col justify-between hover:shadow-md transition-all">
              <div className="w-10 h-10 rounded-2xl bg-[#F88A2B]/5 flex items-center justify-center text-[#F88A2B] mb-4">
                <kpi.icon className="w-5 h-5" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#0B0908]">{kpi.value}</div>
                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{kpi.label}</div>
              </div>
            </div>
          ))}
        </section>

        {/* Status de Conformidade */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Status de conformidade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complianceStatus.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl shadow-sm border border-zinc-100 flex gap-4 hover:border-[#F88A2B]/20 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm">{item.title}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tighter">
                      {item.status}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Controles Ativos */}
        <section className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-zinc-100">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500 mb-6">Controles ativos</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-8">
            {activeControls.map((control, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-zinc-600 capitalize">{control}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Riscos e Recomendações */}
        <section className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Riscos e recomendações</h3>
          <div className="bg-white/40 backdrop-blur-md border border-white p-8 rounded-[2.5rem] shadow-sm space-y-6">
            <div className="flex items-center gap-3 text-emerald-600 bg-emerald-50 w-fit px-4 py-2 rounded-full border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-bold">Sem riscos críticos no momento.</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                "revisar política de retenção trimestralmente",
                "manter admins atualizados",
                "revisar exportações recorrentes",
                "acompanhar consentimentos pendentes"
              ].map((rec, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white/50 border border-white/80">
                  <div className="w-2 h-2 rounded-full bg-[#F88A2B]" />
                  <span className="text-xs font-medium text-zinc-600 capitalize">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Consentimentos */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Consentimentos</h3>
                <ClipboardCheck className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="space-y-1">
                <div className="text-4xl font-bold">98%</div>
                <p className="text-xs text-zinc-400">Consentimentos aceitos</p>
              </div>
              <div className="flex items-center gap-4 pt-2">
                <div className="text-xs font-bold text-zinc-600">14 pendentes</div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-wider">Última atualização: Maio 2026</div>
              </div>
            </div>
            <button 
              onClick={() => navigate('/enterprise/rh/consentimentos')}
              className="w-full bg-[#0B0908] text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              Ver consentimentos <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Retenção de Dados */}
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Retenção de dados</h3>
                <Database className="w-5 h-5 text-zinc-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Logs ADM", val: "12 meses" },
                  { label: "Exportações", val: "90 dias" },
                  { label: "Agregados", val: "24 meses" },
                  { label: "Canal Direto", val: "Política sep." }
                ].map((item, idx) => (
                  <div key={idx}>
                    <div className="text-xs font-bold text-[#0B0908]">{item.val}</div>
                    <div className="text-[10px] text-zinc-400 uppercase tracking-tighter">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
            <button 
              onClick={() => navigate('/enterprise/rh/retencao-dados')}
              className="w-full bg-[#0B0908] text-white py-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 hover:bg-zinc-800 transition-colors"
            >
              Configurar retenção <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Auditoria */}
        <section className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-500">Auditoria</h3>
            <Fingerprint className="w-5 h-5 text-zinc-300" />
          </div>
          <p className="text-sm text-zinc-500 leading-relaxed max-w-2xl">
            Logs administrativos registram mudanças de acesso, exportações, integrações e políticas — nunca conteúdo emocional individual.
          </p>
          <button 
            onClick={() => navigate('/enterprise/rh/auditoria')}
            className="bg-zinc-100 text-[#0B0908] px-8 py-4 rounded-2xl font-bold text-xs flex items-center gap-2 hover:bg-zinc-200 transition-colors"
          >
            Ver auditoria <ChevronRight className="w-4 h-4" />
          </button>
        </section>

        {/* Compromisso Ético */}
        <section className="bg-white rounded-[2.5rem] p-8 md:p-12 text-[#0B0908] relative overflow-hidden group border border-zinc-100 shadow-sm">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F88A2B]/5 blur-[120px] rounded-full"></div>
          <div className="relative z-10 text-center space-y-6">
            <div className="flex justify-center">
              <div className="bg-[#F88A2B]/10 text-[#F88A2B] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase border border-[#F88A2B]/20">
                Ética por desenho
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-['Playfair_Display'] text-[#0B0908]">
              Compliance não é burocracia. É proteção da confiança.
            </h2>
            <p className="text-zinc-500 text-sm md:text-base leading-relaxed max-w-xl mx-auto">
              O Enterprise existe para apoiar inteligência emocional coletiva sem transformar cuidado em vigilância.
            </p>
          </div>
        </section>

        {/* Footer Actions */}
        <div className="flex flex-col gap-4 pt-8">
          <button 
            onClick={() => navigate('/enterprise/rh/consentimentos')}
            className="w-full bg-[#F88A2B] text-white py-5 rounded-2xl font-bold text-sm shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all"
          >
            Ver consentimentos
          </button>
          <button 
            onClick={() => navigate('/enterprise/rh/politicas')}
            className="w-full bg-white text-[#0B0908] border border-zinc-200 py-5 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
          >
            Voltar para políticas
          </button>
        </div>

        <footer className="pt-8 pb-12 text-center">
          <p className="text-[11px] text-zinc-400 leading-relaxed max-w-[320px] mx-auto italic">
            "Conformidade Enterprise protege a organização e preserva a privacidade emocional do colaborador."
          </p>
        </footer>
      </main>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseComplianceScreen;
