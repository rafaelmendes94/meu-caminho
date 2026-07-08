import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Wind, 
  Brain, 
  Coffee, 
  Users, 
  Sparkles, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  Star, 
  Lock, 
  ShieldCheck, 
  Heart,
  Activity,
  Zap,
  MoreVertical,
  Plus
} from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseGuidedRitualsScreen = () => {
  const navigate = useNavigate();

  const recommendedRituals = [
    { 
      title: "Pausa cognitiva", 
      duration: "5 min", 
      desc: "Desaceleração mental após ciclos intensos.", 
      icon: Brain,
      color: "bg-blue-50 text-blue-600"
    },
    { 
      title: "Respiração coletiva", 
      duration: "3 min", 
      desc: "Ritual rápido para recuperar presença emocional.", 
      icon: Wind,
      color: "bg-teal-50 text-teal-600"
    },
    { 
      title: "Reflexão da semana", 
      duration: "10 min", 
      desc: "Espaço coletivo para reorganizar pensamentos.", 
      icon: Coffee,
      color: "bg-amber-50 text-amber-600"
    },
    { 
      title: "Check-in de liderança", 
      duration: "15 min", 
      desc: "Escuta emocional segura entre líderes.", 
      icon: Users,
      color: "bg-purple-50 text-purple-600"
    },
  ];

  const calendarEvents = [
    { day: "Seg", time: "08:30", title: "Check-in coletivo", type: "Presença" },
    { day: "Ter", time: "14:00", title: "Pausa coletiva", type: "Recuperação" },
    { day: "Qui", time: "09:00", title: "Ritual executivo", type: "Liderança" },
    { day: "Sex", time: "16:30", title: "Reflexão semanal", type: "Cultura" },
  ];

  const impacts = [
    { label: "Redução de aceleração mental", value: 65 },
    { label: "Aumento da sensação de segurança", value: 88 },
    { label: "Melhora da clareza emocional", value: 42 },
    { label: "Fortalecimento coletivo", value: 94 },
  ];

  const activeRituals = [
    { title: "Pausa cognitiva semanal", schedule: "Toda terça · 14h" },
    { title: "Reflexão executiva", schedule: "Quinta · 09h" },
    { title: "Check-in coletivo", schedule: "Segunda · 08h30" },
  ];

  return (
    <EnterpriseRHLayout title="Rituais">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] text-[#0B0908] font-montserrat overflow-y-auto pb-32">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-[#F7F4F2]/80 backdrop-blur-md z-50 px-6 py-4 flex items-center justify-between border-b border-[#0B0908]/5">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/enterprise/rh/rituais")}
            className="p-2 hover:bg-white rounded-full transition-colors shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-[#0B0908]" />
          </button>
          <h1 className="font-playfair text-xl font-bold">Rituais guiados</h1>
        </div>
        <div className="px-4 py-1.5 bg-white border border-[#F88A2B]/20 rounded-full flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-[#F88A2B]" />
          <span className="text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">Cultura viva</span>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#0B0908] p-10 md:p-16 text-white shadow-2xl group">
          <div className="absolute top-[-20%] right-[-10%] w-[40rem] h-[40rem] bg-[#F88A2B]/10 blur-[120px] rounded-full group-hover:bg-[#F88A2B]/20 transition-all duration-1000" />
          
          <div className="relative z-10 max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
              <Star className="w-4 h-4 text-[#F88A2B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white">Experiência coletiva</span>
            </div>
            
            <h2 className="text-4xl md:text-6xl font-playfair leading-[1.1]">
              A cultura emocional se fortalece nos pequenos momentos coletivos.
            </h2>
            
            <p className="text-white/60 text-base md:text-lg leading-relaxed font-light">
              O Enterprise ajuda a transformar pausas, reflexões e escuta em parte viva da cultura organizacional.
            </p>
          </div>

          {/* Abstract Organic Lines */}
          <svg className="absolute bottom-0 right-0 w-full h-full opacity-5 pointer-events-none" viewBox="0 0 800 400">
            <path d="M0,350 C200,300 400,350 T800,350" stroke="white" fill="transparent" strokeWidth="1" />
            <path d="M0,300 C300,250 500,300 T800,300" stroke="white" fill="transparent" strokeWidth="1" />
          </svg>
        </section>

        {/* Recommended Rituals Grid */}
        <section className="space-y-8">
          <h3 className="font-playfair text-2xl font-bold px-2">Rituais recomendados</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedRituals.map((ritual, idx) => (
              <div key={idx} className="bg-white p-8 rounded-[2.5rem] border border-[#0B0908]/5 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between group h-full">
                <div className="space-y-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${ritual.color}`}>
                    <ritual.icon className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-playfair text-xl font-bold">{ritual.title}</h4>
                      <span className="text-[10px] font-bold text-[#0B0908]/40 uppercase tracking-widest">{ritual.duration}</span>
                    </div>
                    <p className="text-sm text-[#0B0908]/60 leading-relaxed font-light">{ritual.desc}</p>
                  </div>
                </div>
                <button className="mt-8 w-full py-3 bg-[#F7F4F2] text-[#0B0908] rounded-full text-xs font-bold hover:bg-[#0B0908] hover:text-white transition-all">
                  Aplicar ritual
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Calendário Emocional */}
          <section className="space-y-8">
            <h3 className="font-playfair text-2xl font-bold px-2">Calendário emocional</h3>
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-[#0B0908]/5">
              <div className="space-y-4">
                {calendarEvents.map((event, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-[#F7F4F2]/50 transition-all border border-transparent hover:border-[#0B0908]/5 group">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-2xl bg-[#0B0908] text-white shrink-0">
                      <span className="text-[10px] font-bold uppercase">{event.day}</span>
                      <span className="text-sm font-bold">{event.time}</span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h5 className="font-bold text-[#0B0908]">{event.title}</h5>
                      <p className="text-[10px] text-[#F88A2B] font-bold uppercase tracking-widest">{event.type}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#0B0908]/10 group-hover:text-[#0B0908] transition-colors" />
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Impacto Percebido */}
          <section className="space-y-8">
            <h3 className="font-playfair text-2xl font-bold px-2">Impacto percebido</h3>
            <div className="bg-white rounded-[2.5rem] p-10 shadow-sm border border-[#0B0908]/5 space-y-8">
              {impacts.map((impact, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/40">{impact.label}</span>
                    <span className="text-sm font-bold text-[#F88A2B]">{impact.value}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F7F4F2] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-[#F88A2B] to-[#F88A2B]/60 rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${impact.value}%` }}
                    />
                  </div>
                </div>
              ))}
              <div className="pt-4 flex items-center gap-2 text-[10px] text-[#0B0908]/40 italic uppercase tracking-widest">
                <Activity className="w-3 h-3" />
                <span>Dados de evolução coletiva baseados na cultura.</span>
              </div>
            </div>
          </section>
        </div>

        {/* Rituais Ativos */}
        <section className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="font-playfair text-2xl font-bold">Rituais ativos</h3>
            <span className="text-xs font-bold text-[#F88A2B] uppercase tracking-widest">{activeRituals.length} Iniciativas</span>
          </div>
          <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-sm border border-[#0B0908]/5">
            {activeRituals.map((ritual, idx) => (
              <div key={idx} className="p-8 flex items-center justify-between border-b border-[#0B0908]/5 last:border-0 hover:bg-[#F7F4F2]/30 transition-all">
                <div className="flex items-center gap-6">
                  <div className="w-12 h-12 rounded-full bg-[#F7F4F2] flex items-center justify-center text-[#F88A2B]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[#0B0908]">{ritual.title}</h5>
                    <p className="text-xs text-[#0B0908]/40">{ritual.schedule}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {["Editar", "Pausar", "Duplicar"].map((action) => (
                    <button key={action} className="px-4 py-2 rounded-full border border-[#0B0908]/10 text-[10px] font-bold uppercase tracking-widest hover:bg-[#0B0908] hover:text-white transition-all">
                      {action}
                    </button>
                  ))}
                  <button className="p-2 text-[#0B0908]/20 hover:text-[#0B0908]">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recomendação da IA */}
        <section>
          <div className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-10 border border-[#F88A2B]/20 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <Zap className="w-8 h-8 text-[#F88A2B] animate-pulse" />
            </div>
            
            <div className="max-w-2xl space-y-6">
              <div className="space-y-2">
                <h4 className="font-playfair text-2xl font-bold">Recomendação da IA</h4>
                <p className="text-[#0B0908]/70 leading-relaxed italic font-light">
                  “A IA identificou aumento de aceleração mental em Operações. Rituais curtos de recuperação cognitiva podem ajudar na reorganização coletiva.”
                </p>
              </div>
              <button className="px-8 py-3 bg-[#F88A2B] text-white rounded-full text-xs font-bold uppercase tracking-widest shadow-lg shadow-[#F88A2B]/20 hover:scale-105 transition-all">
                Aplicar sugestão
              </button>
            </div>
          </div>
        </section>

        {/* Como os rituais funcionam */}
        <section className="space-y-8 py-8">
          <h3 className="font-playfair text-2xl font-bold px-2 text-center">Como os rituais funcionam</h3>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-4 lg:gap-12 relative">
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-[#0B0908]/10 to-transparent hidden md:block" />
            
            {[
              { step: 1, title: "RH organiza momento coletivo" },
              { step: 2, title: "Colaboradores participam voluntariamente" },
              { step: 3, title: "A organização fortalece presença emocional" },
              { step: 4, title: "A cultura ganha mais equilíbrio" },
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center text-center space-y-4 max-w-[200px]">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-[#F88A2B] flex items-center justify-center text-[#F88A2B] font-bold text-lg shadow-sm">
                  {step.step}
                </div>
                <p className="text-xs font-bold text-[#0B0908]/60 leading-relaxed uppercase tracking-widest">{step.title}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Privacidade Preservada */}
        <section>
          <div className="bg-[#0B0908] rounded-[2.5rem] p-12 text-white relative overflow-hidden group">
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-[#F88A2B]/10 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-12">
              <div className="max-w-xl space-y-6">
                <div className="flex items-center gap-4 text-[#F88A2B]">
                  <Lock className="w-8 h-8" />
                  <h3 className="font-playfair text-3xl font-bold text-white">Os rituais fortalecem cultura, não monitoram indivíduos.</h3>
                </div>
                <p className="text-white/60 text-lg leading-relaxed font-light">
                  O Enterprise nunca expõe emoções individuais durante experiências coletivas, focando apenas no equilíbrio e fortalecimento do time.
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                  <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">Proteção emocional ativa</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6">
                {[
                  "Participação segura",
                  "Sem exposição emocional",
                  "Sem score individual",
                  "Equilíbrio coletivo",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm text-white/80">
                    <Heart className="w-4 h-4 text-[#F88A2B]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final Actions */}
        <section className="flex flex-col items-center gap-8 py-12">
          <button className="w-full max-w-md bg-[#F88A2B] text-white py-6 rounded-full font-bold text-xl shadow-2xl shadow-[#F88A2B]/30 hover:bg-[#e07b25] transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3">
            <Plus className="w-6 h-6" />
            Criar novo ritual
          </button>
          
          <button 
            onClick={() => navigate("/enterprise/rh/rituais")}
            className="text-[#0B0908]/40 font-bold text-sm uppercase tracking-[0.3em] hover:text-[#0B0908] transition-colors flex items-center gap-2 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Voltar para cultura
          </button>

          <footer className="pt-8 text-center max-w-sm mx-auto">
            <p className="text-[10px] text-[#0B0908]/30 uppercase tracking-[0.2em] font-medium leading-relaxed italic">
              “Uma cultura emocional saudável nasce da repetição consciente de pequenos momentos.”
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

export default EnterpriseGuidedRitualsScreen;
