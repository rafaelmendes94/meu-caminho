import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  TrendingUp, 
  Target, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Brain, 
  Users, 
  ChevronRight, 
  Compass, 
  Star,
  Activity,
  Heart,
  BarChart3,
  Calendar,
  Layers
} from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseRoadmapScreen = () => {
  const navigate = useNavigate();

  const kpis = [
    { label: "Iniciativas ativas", value: "12", icon: Layers },
    { label: "Prioridades estratégicas", value: "4", icon: Target },
    { label: "Ações concluídas", value: "78%", icon: ShieldCheck },
    { label: "Evolução coletiva", value: "+18%", icon: TrendingUp },
  ];

  const currentPriorities = [
    { title: "Reduzir aceleração mental", desc: "Criar pausas cognitivas após ciclos intensos.", status: "Em andamento", color: "text-amber-600 bg-amber-50" },
    { title: "Fortalecer segurança emocional", desc: "Aumentar espaços de escuta coletiva.", status: "Planejado", color: "text-blue-600 bg-blue-50" },
    { title: "Recuperação da liderança", desc: "Estruturar rituais executivos de recuperação cognitiva.", status: "Ativo", color: "text-green-600 bg-green-50" },
  ];

  const timeline = [
    { quarter: "Q1", items: ["Onboarding emocional", "Ativação check-ins"] },
    { quarter: "Q2", items: ["Rituais coletivos", "Escuta da liderança"] },
    { quarter: "Q3", items: ["Fortalecimento cultural", "Recuperação cognitiva"] },
    { quarter: "Q4", items: ["Consolidação organizacional", "Benchmark emocional"] },
  ];

  const priorityAreas = [
    { area: "Operações", insight: "Maior aceleração", icon: Activity },
    { area: "Atendimento", insight: "Necessidade de recuperação", icon: Heart },
    { area: "Liderança", insight: "Fadiga cognitiva crescente", icon: Brain },
    { area: "Produto", insight: "Estabilidade em evolução", icon: Sparkles },
  ];

  const indicators = [
    { label: "Clareza emocional", progress: 65 },
    { label: "Equilíbrio coletivo", progress: 42 },
    { label: "Segurança psicológica", progress: 88 },
    { label: "Recuperação cognitiva", progress: 35 },
    { label: "Adesão ao cuidado emocional", progress: 92 },
  ];

  return (
    <EnterpriseRHLayout title="Roadmap">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50 px-6 py-4 flex items-center justify-between border-b border-[#0B0908]/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/enterprise/rh")}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#0B0908]" />
          </button>
          <h1 className="font-playfair text-xl font-bold">Roadmap organizacional</h1>
        </div>
        <div className="px-4 py-1.5 bg-white border border-[#F88A2B]/20 rounded-full flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#F88A2B]" />
          <span className="text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">Evolução contínua</span>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0B0908] p-10 md:p-16 text-white shadow-2xl">
          <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] bg-[#F88A2B]/20 blur-[120px] rounded-full" />
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Compass className="w-4 h-4 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Planejamento estratégico</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-playfair leading-[1.1]">
              A cultura emocional também precisa de direção.
            </h2>
            
            <p className="text-white/60 text-base md:text-lg leading-relaxed font-light">
              O Enterprise ajuda a transformar percepção emocional coletiva em movimentos organizacionais sustentáveis.
            </p>
          </div>

          <svg className="absolute bottom-0 right-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 800 400">
            <path d="M0,300 C200,350 400,250 800,300" stroke="white" fill="transparent" strokeWidth="1" />
            <path d="M0,250 C300,200 500,300 800,200" stroke="white" fill="transparent" strokeWidth="1" />
          </svg>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl border border-[#0B0908]/5 shadow-sm hover:shadow-md transition-all group">
              <kpi.icon className="w-6 h-6 mb-6 text-[#F88A2B]" />
              <div className="space-y-1">
                <p className="text-3xl font-playfair font-bold text-[#0B0908]">{kpi.value}</p>
                <p className="text-[10px] uppercase tracking-wider text-[#0B0908]/40 font-bold">{kpi.label}</p>
              </div>
            </div>
          ))}
        </section>

        {/* Current Priorities */}
        <section className="space-y-8">
          <h3 className="font-playfair text-2xl font-bold px-2">Prioridades atuais</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentPriorities.map((priority, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-[#0B0908]/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group h-full">
                <div className="space-y-4">
                  <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${priority.color}`}>
                    {priority.status}
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-playfair text-xl font-bold">{priority.title}</h4>
                    <p className="text-sm text-[#0B0908]/60 leading-relaxed">{priority.desc}</p>
                  </div>
                </div>
                <button className="mt-8 flex items-center gap-2 text-xs font-bold text-[#F88A2B] uppercase tracking-widest group-hover:gap-4 transition-all">
                  Ver detalhes <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Timeline Section */}
        <section className="space-y-8 relative py-12">
          <h3 className="font-playfair text-2xl font-bold px-2">Timeline organizacional</h3>
          
          <div className="relative flex flex-col md:flex-row gap-8 overflow-x-auto pb-8 scrollbar-hide">
            {/* Background Path Line */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0B0908]/10 to-transparent hidden md:block" />
            
            {timeline.map((stage, idx) => (
              <div key={idx} className="relative flex-1 min-w-[280px] group">
                <div className="bg-white p-8 rounded-[2.5rem] border border-[#0B0908]/5 shadow-sm hover:border-[#F88A2B]/20 transition-all relative z-10">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-[#0B0908] text-white flex items-center justify-center font-playfair font-bold text-xl">
                      {stage.quarter}
                    </div>
                    <div className="h-px flex-1 bg-[#0B0908]/5" />
                  </div>
                  <ul className="space-y-4">
                    {stage.items.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] mt-1.5" />
                        <span className="text-sm font-medium text-[#0B0908]/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Connector Glow */}
                <div className="absolute -inset-2 bg-gradient-to-b from-[#F88A2B]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-[3rem] pointer-events-none" />
              </div>
            ))}
          </div>
        </section>

        {/* IA Insights */}
        <section>
          <div className="bg-white/40 backdrop-blur-md rounded-[2.5rem] p-10 border border-[#F88A2B]/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <Sparkles className="w-8 h-8 text-[#F88A2B] animate-pulse" />
            </div>
            
            <div className="max-w-3xl space-y-8">
              <div className="space-y-2">
                <h4 className="font-playfair text-2xl font-bold">Movimentos sugeridos pela IA</h4>
                <p className="text-[#0B0908]/70 leading-relaxed italic font-light">
                  “A IA identificou que ações de desaceleração mental e recuperação executiva podem gerar impacto positivo na clareza coletiva.”
                </p>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {["Pausas cognitivas", "Rituais de recuperação", "Check-ins mais frequentes", "Escuta da liderança"].map((sug, i) => (
                  <div key={i} className="bg-white p-4 rounded-2xl border border-[#0B0908]/5 shadow-sm text-center">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#0B0908]/80">{sug}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Priority Areas */}
        <section className="space-y-8">
          <h3 className="font-playfair text-2xl font-bold px-2">Áreas prioritárias</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {priorityAreas.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-[#0B0908]/5 shadow-sm hover:scale-[1.02] transition-all group">
                <div className="w-10 h-10 rounded-xl bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B] mb-4 group-hover:bg-[#0B0908] group-hover:text-white transition-colors">
                  <item.icon className="w-5 h-5" />
                </div>
                <h5 className="font-bold text-[#0B0908] mb-1">{item.area}</h5>
                <p className="text-[10px] text-[#F88A2B] font-bold uppercase tracking-widest">{item.insight}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Evolution Indicators */}
        <section className="space-y-8">
          <h3 className="font-playfair text-2xl font-bold px-2">Indicadores de evolução</h3>
          <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#0B0908]/5 space-y-8">
            {indicators.map((indicator, idx) => (
              <div key={idx} className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-[#0B0908]/50">
                  <span>{indicator.label}</span>
                  <span className="text-[#0B0908]">{indicator.progress}%</span>
                </div>
                <div className="h-2 w-full bg-[#F7F4F2] rounded-full overflow-hidden p-0.5">
                  <div 
                    className="h-full bg-gradient-to-r from-[#F88A2B] to-[#F88A2B]/70 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${indicator.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Strategic Reading */}
        <section>
          <div className="bg-[#0B0908] rounded-[2.5rem] p-12 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10">
              <Compass className="w-48 h-48" />
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl space-y-6 text-center md:text-left">
                <div className="flex items-center justify-center md:justify-start gap-4 text-[#F88A2B]">
                  <h3 className="font-playfair text-3xl font-bold text-white">O cuidado coletivo precisa virar movimento contínuo.</h3>
                </div>
                <p className="text-white/60 text-lg leading-relaxed font-light">
                  O roadmap emocional ajuda a organização a transformar percepção em evolução prática e sustentável.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <Star className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-xs font-bold uppercase tracking-widest">Cultura viva</span>
                </div>
              </div>
              
              <div className="w-full md:w-auto">
                <div className="w-32 h-32 rounded-full border border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 border-t-2 border-[#F88A2B] rounded-full animate-spin duration-[3000ms]" />
                  <TrendingUp className="w-8 h-8 text-[#F88A2B]" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="flex flex-col items-center gap-8 py-12">
          <button className="w-full max-w-md bg-[#F88A2B] text-white py-6 rounded-full font-bold text-xl shadow-2xl shadow-[#F88A2B]/30 hover:bg-[#e07b25] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
            <Zap className="w-6 h-6" />
            Criar nova iniciativa
          </button>
          
          <button 
            onClick={() => navigate("/enterprise/rh/dashboard")}
            className="text-[#0B0908]/40 font-bold text-sm uppercase tracking-[0.3em] hover:text-[#0B0908] transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar ao dashboard
          </button>

          <footer className="pt-8 text-center max-w-sm mx-auto">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-medium leading-relaxed italic">
              “O roadmap organizacional transforma inteligência emocional em evolução contínua.”
            </p>
          </footer>
        </section>

      </main>

      {/* Background Decorative Blur */}
      <div className="fixed top-[-10%] right-[-10%] w-[50rem] h-[50rem] bg-[#F88A2B]/5 blur-[150px] rounded-full pointer-events-none -z-10" />
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseRoadmapScreen;
