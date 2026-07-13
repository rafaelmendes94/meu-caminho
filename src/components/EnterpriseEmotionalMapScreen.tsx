import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { 
  ShieldCheck, 
  Sparkles, 
  Info, 
  ChevronRight,
  Wind,
  Zap,
  Brain,
  Activity,
  LayoutDashboard
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const EnterpriseEmotionalMapScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [weeks, setWeeks] = useState<Array<{ week_of: string; avg_mood: number; avg_energy: number; avg_stress: number; equilibrium_index: number; participants_count: number }>>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!organization?.id) return;
    void supabase
      .rpc("get_emotional_map", { _organization_id: organization.id, _weeks: 8 })
      // deno-lint-ignore no-explicit-any
      .then(({ data }: any) => { setWeeks(data ?? []); setLoaded(true); });
  }, [organization?.id]);

  const emotionalAreas: Array<{ name: string; state: string; intensity: number; color: string }> = [];
  const states: Array<{ label: string; value: string; icon: JSX.Element; color: string }> = [];
  const weeklyMovement: Array<{ day: string; pressure: string; desc: string; color: string }> = [];

  return (
    <EnterpriseRHLayout title="Mapa emocional">
      <div className="space-y-8 animate-fade-in bg-white -mx-6 lg:mx-0 px-6 lg:px-0 pb-20">
        {/* Hero Card */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white border border-black/5 text-[#111] rounded-[2rem] p-8 shadow-sm"
        >
          {/* Animated Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px] -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-amber-500/5 rounded-full blur-[60px] -ml-24 -mb-24" />
          
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-black/5 rounded-full w-fit border border-black/5 backdrop-blur-sm">
              <ShieldCheck className="w-3 h-3 text-orange-400" />
              <span className="text-[10px] uppercase tracking-widest font-medium text-[#333]">Agregado e anônimo</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-[#111]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
              A empresa também possui estados emocionais coletivos.
            </h2>
            <p className="text-[#666] text-sm md:text-base font-medium leading-relaxed max-w-3xl">
              Visualize padrões de equilíbrio, clareza e sobrecarga sem expor nenhum indivíduo através de dados anonimizados.
            </p>
          </div>
        </motion.section>

        {/* Mapa Emocional Principal */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-widest font-bold text-black/40">Mapa emocional atual</h3>
            <span className="text-[10px] text-black/30 bg-black/5 px-2 py-1 rounded-md">Tempo Real</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emotionalAreas.length === 0 && (
              <p className="text-sm text-black/50 italic py-6 col-span-full text-center">
                Ainda não há dados agregados suficientes por área.
              </p>
            )}
            {emotionalAreas.map((area, idx) => (
              <motion.div
                key={area.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-6 rounded-[24px] border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex flex-col gap-4 group hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-black/40 font-bold block mb-0.5">{area.name}</span>
                    <h4 className="font-playfair text-xl italic font-bold text-[#111]">{area.state}</h4>
                  </div>
                  <div className={`h-10 w-10 rounded-xl ${area.color}/10 flex items-center justify-center`}>
                    <Activity className={`w-5 h-5 ${area.color.replace('bg-', 'text-')}`} />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-bold text-black/30 uppercase tracking-tighter">Nível de Intensidade</span>
                    <span className="text-[14px] font-bold text-[#111]">{area.intensity}%</span>
                  </div>
                  <div className="h-2 w-full bg-black/[0.03] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${area.intensity}%` }}
                      transition={{ delay: 0.5 + idx * 0.1, duration: 1.5, ease: "easeOut" }}
                      className={`h-full ${area.color} rounded-full`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-1.5">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-[9px] font-bold text-black/20 uppercase">Dados em tempo real</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Estados Predominantes */}
        <section className="space-y-6">
          <h3 className="text-sm uppercase tracking-widest font-bold text-black/40">Estados predominantes</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {states.length === 0 && (
              <p className="text-sm text-black/50 italic py-6 col-span-full text-center">
                Estados predominantes ainda não disponíveis.
              </p>
            )}
            {states.map((state, idx) => (
              <motion.div
                key={state.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.1 }}
                className="bg-white p-6 rounded-[24px] border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group flex flex-col justify-between h-full"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className={`p-2.5 rounded-xl bg-black/[0.02] transition-colors group-hover:bg-black/[0.05]`}>
                    {state.icon}
                  </div>
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 opacity-50" />
                </div>
                
                <div className="space-y-1">
                  <p className="text-[32px] font-extrabold tracking-tighter text-[#111]" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                    {state.value}
                  </p>
                  <p className="text-[11px] text-black/40 font-bold uppercase tracking-wider">{state.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Movimento Emocional da Semana */}
        <section className="space-y-6 bg-white p-8 rounded-[32px] border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-between">
            <h3 className="text-sm uppercase tracking-widest font-bold text-black/40">Movimento emocional da semana</h3>
            <div className="p-2 bg-emerald-50 rounded-full">
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          {loaded && weeks.length === 0 ? (
            <p className="text-sm text-black/50 italic py-10 text-center">
              Ainda não há volume mínimo de dados agregados para exibir o mapa emocional.
            </p>
          ) : (
          <div className="flex items-end justify-between gap-2 h-48 px-4">
            {weeklyMovement.map((item, idx) => (
              <div key={item.day} className="flex-1 flex flex-col items-center gap-4 group">
                <div className="relative w-full flex flex-col items-center">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: parseInt(item.color.split('h-')[1]) * 4 }}
                    transition={{ delay: 0.6 + idx * 0.1, duration: 1 }}
                    className={`w-4 md:w-6 rounded-t-full rounded-b-lg ${item.color.split(' ')[1]} transition-all group-hover:scale-110`}
                  />
                </div>
                <div className="text-center space-y-1">
                  <span className="text-[10px] font-bold text-black/40 uppercase block">{item.day.slice(0, 3)}</span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -mt-24 bg-black text-[#111] text-[9px] py-1 px-2 rounded-lg whitespace-nowrap pointer-events-none">
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}

          {weeks.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-black/5">
              {weeks.slice(0, 4).map((w) => (
                <div key={w.week_of} className="rounded-2xl bg-black/[0.02] p-3">
                  <p className="text-[10px] uppercase tracking-widest text-black/40 font-bold">{w.week_of}</p>
                  <p className="text-[16px] font-bold text-[#111]">{Number(w.equilibrium_index).toFixed(2)}</p>
                  <p className="text-[10px] text-black/40">{w.participants_count} participantes</p>
                </div>
              ))}
            </div>
          )}

          <p className="text-[11px] text-black/40 italic pt-2">
            Indicadores exibidos apenas quando há amostra mínima de 5 participantes. Dados individuais nunca são exibidos.
          </p>

        </section>

        {/* Leitura Coletiva da IA */}
        <section className="bg-orange-50 rounded-[2.5rem] p-8 border border-orange-100/50 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-500 rounded-2xl flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Sparkles className="w-5 h-5 text-[#111]" />
            </div>
            <div>
              <h3 className="font-['Playfair_Display'] text-lg font-bold italic">Leitura coletiva da IA</h3>
              <p className="text-[10px] uppercase tracking-widest text-orange-600/60 font-bold">Insight Estratégico</p>
            </div>
          </div>

          <p className="text-black/60 text-sm leading-relaxed italic">
            A leitura coletiva será gerada automaticamente pela IA quando houver volume mínimo de dados agregados.
          </p>
        </section>

        {/* Como interpretar */}
        <section className="bg-white/40 backdrop-blur-md border border-black/5 rounded-[2.5rem] p-8 space-y-4">
          <div className="flex items-center gap-2 text-black/40">
            <Info className="w-4 h-4" />
            <h4 className="text-[10px] uppercase tracking-widest font-bold">Como interpretar o mapa</h4>
          </div>
          <p className="text-black/60 text-sm font-light leading-relaxed italic">
            "O mapa emocional representa apenas tendências coletivas e agregadas da organização. Nenhuma emoção individual pode ser identificada."
          </p>
          <ul className="grid grid-cols-2 gap-y-3 gap-x-6 pt-2">
            {[
              "Sem monitoramento individual",
              "Anonimização automática",
              "Leitura coletiva",
              "Prevenção emocional"
            ].map((text) => (
              <li key={text} className="flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-medium text-black/40">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Visão Estratégica */}
        <section className="bg-white border border-black/5 text-[#111] rounded-[32px] p-8 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 space-y-4">
            <h3 className="text-2xl font-['Playfair_Display'] italic font-bold">Perceber padrões antes do desgaste silencioso.</h3>
            <p className="text-[#666] text-sm font-light leading-relaxed">
              O mapa emocional ajuda liderança e RH a enxergar movimentos coletivos antes que eles se transformem em perda de clareza, ruptura cultural ou esgotamento contínuo.
            </p>
          </div>
        </section>

        {/* Actions */}
        <section className="flex flex-col gap-3 pt-4">
          <EnterpriseRHButton 
            onClick={() => navigate("/enterprise/rh/insights-ia")}
            icon={ChevronRight}
            className="flex-row-reverse"
          >
            Ver insights de IA
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate("/enterprise/rh/dashboard")}
            variant="outline"
            icon={LayoutDashboard}
          >
            Voltar ao dashboard
          </EnterpriseRHButton>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8">
          <p className="text-[10px] text-black/30 font-medium max-w-[200px] mx-auto leading-relaxed uppercase tracking-tighter">
            Todos os padrões exibidos são coletivos, agregados e protegidos por anonimização automática.
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseEmotionalMapScreen;
