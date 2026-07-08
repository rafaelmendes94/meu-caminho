import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Users, 
  ChevronRight,
  Brain,
  Zap,
  Calendar,
  Info,
  Wind,
  X,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseRitualsScreen = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const rituals = [
    {
      id: 1,
      title: "Pausa de desaceleração",
      description: "5 minutos de recuperação mental após reuniões intensas.",
      frequency: "Diariamente",
      participation: "72%",
      icon: <Wind className="w-5 w-5 text-[#F88A2B]" />
    },
    {
      id: 2,
      title: "Momento de escuta coletiva",
      description: "Espaço seguro para percepção emocional da equipe.",
      frequency: "Semanal",
      participation: "64%",
      icon: <Users className="w-5 w-5 text-[#F88A2B]" />
    },
    {
      id: 3,
      title: "Check-in consciente",
      description: "Percepção rápida de equilíbrio emocional antes do início do dia.",
      frequency: "3x por semana",
      participation: "81%",
      icon: <Brain className="w-5 w-5 text-[#F88A2B]" />
    }
  ];

  const impacts = [
    { label: "Redução de aceleração mental", value: 68 },
    { label: "Maior sensação de apoio", value: 84 },
    { label: "Melhora de clareza coletiva", value: 72 },
    { label: "Recuperação emocional gradual", value: 59 }
  ];

  const suggestedRituals = [
    "Pausas cognitivas após ciclos intensos.",
    "Espaços breves de escuta em liderança.",
    "Momentos coletivos de recuperação mental.",
    "Conteúdos guiados sobre mente acelerada."
  ];

  const timeline = [
    { day: "SEGUNDA", event: "check-in coletivo" },
    { day: "QUARTA", event: "pausa consciente" },
    { day: "SEXTA", event: "momento de recuperação" }
  ];

  return (
    <EnterpriseRHLayout title="Rituais coletivos">
      <div className="space-y-8 animate-fade-in py-2">
        {/* HERO */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black/5 text-[#111] rounded-3xl p-8 relative overflow-hidden shadow-sm"
        >
          {/* Removed blobs for clean white background */}
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#F88A2B]/20 flex items-center justify-center border border-[#F88A2B]/30">
                <Sparkles className="w-4 h-4 text-[#F88A2B]" />
              </div>
              <span className="text-[#666] text-xs uppercase tracking-[0.2em] font-medium">Cuidado coletivo</span>
            </div>

            <h2 className="font-playfair text-2xl md:text-3xl text-[#111] leading-tight mb-4">
              Culturas saudáveis são construídas em pequenos rituais repetidos.
            </h2>
            <p className="text-[#444] text-sm md:text-base leading-relaxed">
              O Enterprise ajuda a transformar equilíbrio emocional em prática organizacional contínua.
            </p>
          </div>
        </motion.div>

        {/* RITUAIS ATIVOS */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-playfair text-xl font-bold">Rituais ativos</h3>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-[#F88A2B] text-sm font-bold flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Novo
            </button>
          </div>

          <div className="grid gap-4">
            {rituals.map((ritual, index) => (
              <motion.div
                key={ritual.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex items-start gap-4 group hover:shadow-md transition-all cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
                  {ritual.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-bold text-[#0B0908] truncate">{ritual.title}</h4>
                    <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-wider">{ritual.frequency}</span>
                  </div>
                  <p className="text-sm text-[#0B0908]/60 leading-relaxed mb-3">
                    {ritual.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-medium text-[#0B0908]/40">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      <span>{ritual.participation} de participação</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-5 h-5 text-[#0B0908]/20 group-hover:text-[#F88A2B] transition-colors self-center" />
              </motion.div>
            ))}
          </div>
        </section>

        {/* IMPACTO PERCEBIDO */}
        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Impacto percebido</h3>
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 space-y-6">
            {impacts.map((impact, index) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-[#0B0908]/60">
                  <span>{impact.label}</span>
                  <span className="text-[#F88A2B]">{impact.value}%</span>
                </div>
                <div className="h-2 w-full bg-black/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${impact.value}%` }}
                    transition={{ duration: 1, delay: index * 0.2 }}
                    className="h-full bg-gradient-to-r from-[#F88A2B] to-[#F88A2B]/60 rounded-full"
                  />
                </div>
              </div>
            ))}
            <div className="pt-2 flex items-center gap-2 text-xs text-[#0B0908]/40 bg-black/[0.02] p-4 rounded-2xl border border-black/5">
              <Info className="w-4 h-4 shrink-0 text-[#F88A2B]" />
              <p>Percepção coletiva baseada em indicadores de bem-estar organizacional.</p>
            </div>
          </div>
        </section>

        {/* CALENDARIO EMOCIONAL */}
        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Calendário emocional</h3>
          <div className="relative">
            <div className="absolute left-6 top-4 bottom-4 w-px bg-gradient-to-b from-[#F88A2B]/30 via-[#F88A2B]/10 to-transparent" />
            <div className="space-y-6">
              {timeline.map((item, index) => (
                <div key={index} className="flex items-center gap-6 group">
                  <div className="w-12 h-12 rounded-full bg-white border border-black/5 flex items-center justify-center relative z-10 shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-5 h-5 text-[#F88A2B]" />
                  </div>
                  <div className="flex-1 bg-white p-4 rounded-2xl border border-black/5 shadow-sm">
                    <span className="text-[10px] font-bold text-[#F88A2B] uppercase tracking-widest">{item.day}</span>
                    <h4 className="font-bold text-sm text-[#0B0908]">{item.event}</h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PRÓXIMOS RITUAIS */}
        <section className="space-y-4">
          <h3 className="font-playfair text-xl font-bold">Próximos rituais sugeridos</h3>
          <div className="flex overflow-x-auto gap-4 pb-4 snap-x no-scrollbar">
            {suggestedRituals.map((text, index) => (
              <motion.div 
                key={index}
                whileTap={{ scale: 0.98 }}
                className="min-w-[200px] bg-white rounded-3xl p-6 shadow-sm border border-black/5 flex flex-col justify-between h-40 snap-start"
              >
                <div className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center mb-4">
                  <Sparkles className="w-4 h-4 text-[#F88A2B]" />
                </div>
                <p className="text-sm font-bold leading-tight text-[#0B0908]">
                  {text}
                </p>
                <button className="text-[10px] uppercase tracking-widest font-bold text-[#F88A2B] mt-4 flex items-center gap-1">
                  Ativar <ChevronRight className="w-3 h-3" />
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* LEITURA ORGANIZACIONAL */}
        <div className="bg-white rounded-3xl p-8 border border-black/5 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-[#F88A2B]/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-[#F88A2B]" />
            </div>
            <p className="text-sm text-[#0B0908]/80 leading-relaxed italic">
              “Empresas que criam pequenos rituais recorrentes tendem a desenvolver maior clareza emocional, recuperação coletiva e estabilidade cultural.”
            </p>
          </div>
        </div>

        {/* CULTURA SUSTENTÁVEL */}
        <section className="bg-white border border-black/5 text-[#111] rounded-3xl p-8 relative overflow-hidden shadow-sm">
          {/* Removed blob */}
          <div className="relative z-10">
            <h3 className="font-playfair text-xl font-bold mb-3">O cuidado precisa virar comportamento.</h3>
            <p className="text-[#666] text-sm leading-relaxed mb-6">
              O impacto emocional organizacional não nasce de ações isoladas, mas da repetição consistente de práticas saudáveis ao longo do tempo.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => setIsModalOpen(true)}
                className="w-full bg-[#F88A2B] text-[#111] py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Plus className="w-5 h-5" /> Criar novo ritual
              </button>
              <button 
                onClick={() => navigate('/enterprise/rh')}
                className="w-full bg-black/[0.03] border border-black/5 text-[#111] py-4 rounded-2xl font-bold text-sm active:scale-[0.98] transition-all"
              >
                Voltar ao módulo RH
              </button>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="pt-4 pb-8 flex flex-col items-center gap-6">
          <div className="flex items-center gap-2 text-[#0B0908]/40 bg-black/[0.03]0 px-4 py-2 rounded-full border border-black/5">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-[10px] uppercase tracking-widest font-medium">Os rituais fortalecem equilíbrio coletivo sem monitorar indivíduos.</span>
          </div>
        </footer>
      </div>

      {/* MODAL MOCKADO */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-[40px] z-[101] p-8 pb-12 max-w-2xl mx-auto shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-black/10 rounded-full mx-auto mb-8" />
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="font-playfair text-2xl font-bold">Criar ritual</h2>
                  <p className="text-[#0B0908]/60 text-sm">Configure uma nova prática emocional para o time.</p>
                </div>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/40 px-1">Nome do ritual</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Pausa contemplativa"
                    className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/40 px-1">Frequência</label>
                    <select className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 appearance-none">
                      <option>Diário</option>
                      <option>Semanal</option>
                      <option>3x por semana</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/40 px-1">Público</label>
                    <select className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 appearance-none">
                      <option>Toda a empresa</option>
                      <option>Liderança</option>
                      <option>Departamentos</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-[#0B0908]/40 px-1">Objetivo emocional</label>
                  <textarea 
                    rows={3}
                    placeholder="Descreva o propósito deste ritual..."
                    className="w-full bg-white border border-black/5 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 resize-none"
                  />
                </div>

                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-[#F88A2B] text-[#111] py-4 rounded-2xl font-bold text-sm shadow-xl shadow-[#F88A2B]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-5 h-5" /> Confirmar ritual
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseRitualsScreen;