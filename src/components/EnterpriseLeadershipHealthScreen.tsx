import { useNavigate } from "react-router-dom";
import { Brain, ShieldCheck, TrendingUp, Zap, Heart, Info, ArrowRight, UserCheck, BarChart3, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

const EnterpriseLeadershipHealthScreen = () => {
  const navigate = useNavigate();

  return (
    <EnterpriseRHLayout title="Saúde da liderança">
      <div className="space-y-12 animate-fade-in py-2 bg-white -mx-6 lg:mx-0 px-6 lg:px-0 pb-20">
        {/* Hero */}
        <motion.section 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-black/5 text-[#111] p-8 rounded-3xl relative overflow-hidden shadow-sm shadow-black/5"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B]/10 rounded-full blur-3xl" />
          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2 text-[#F88A2B] text-sm font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" />
              <span>Leitura preventiva</span>
            </div>
            <h2 className="font-extrabold text-3xl leading-tight tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Lideranças emocionalmente sobrecarregadas reduzem clareza coletiva.</h2>
            <p className="text-[#666] leading-relaxed font-medium">O Enterprise ajuda a perceber padrões emocionais da liderança antes que desgaste contínuo afete cultura e tomada de decisão.</p>
          </div>
        </motion.section>

        {/* KPIs */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
          {[
            { label: "Energia sustentável", value: "—" },
            { label: "Sinais de sobrecarga", value: "—" },
            { label: "Clareza emocional", value: "—" },
            { label: "Recuperação coletiva", value: "—" },
          ].map((kpi, i) => (
            <div key={i} className="bg-white p-6 rounded-[24px] border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="text-[32px] font-extrabold tracking-tighter text-[#111]" style={{ fontFamily: "'Montserrat', sans-serif" }}>{kpi.value}</div>
              <div className="text-[11px] text-black/40 font-bold uppercase tracking-wider">{kpi.label}</div>
            </div>
          ))}
        </section>

        {/* Leitura Coletiva */}
        <section className="bg-white p-8 rounded-[32px] border border-black/5 shadow-sm px-1 mx-1">
          <h3 className="font-extrabold text-xl mb-4 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Leitura coletiva das lideranças</h3>
          <p className="text-[#666] leading-relaxed font-medium italic">Aguardando amostra mínima de lideranças para gerar a leitura coletiva.</p>
        </section>

        {/* Sinais Observados */}
        <section>
          <h3 className="font-extrabold text-xl mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Principais sinais observados</h3>
          <p className="text-[13px] text-[#999] italic">
            Sinais aparecem quando houver dados agregados suficientes das lideranças.
          </p>
        </section>

        {/* Indicadores */}
        <section className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
          <h3 className="font-extrabold text-xl mb-8 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Indicadores emocionais</h3>
          <p className="text-[13px] text-[#999] italic">
            Aguardando dados agregados para exibir os indicadores emocionais das lideranças.
          </p>
        </section>

        {/* Fatores e Movimentos */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h3 className="font-extrabold text-xl mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Fatores associados</h3>
            <p className="text-[13px] text-[#999] italic">
              Fatores associados serão listados a partir dos dados coletados.
            </p>
          </section>
          <section>
            <h3 className="font-extrabold text-xl mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Movimentos sugeridos</h3>
            <p className="text-[13px] text-[#999] italic">
              Movimentos sugeridos serão gerados pela IA a partir dos sinais das lideranças.
            </p>
          </section>
        </div>

        {/* Impacto e Visão */}
        <section className="bg-white border border-black/5 p-8 rounded-3xl shadow-sm">
          <h3 className="font-extrabold text-xl mb-4 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Impacto organizacional</h3>
          <p className="text-[#666] italic leading-relaxed font-medium">"Lideranças emocionalmente mais equilibradas tendem a gerar ambientes com maior clareza, menor desgaste coletivo e mais segurança emocional."</p>
        </section>

        <section className="bg-white border border-black/5 p-8 rounded-[32px] text-center space-y-6 shadow-sm">
          <h3 className="text-2xl font-extrabold tracking-tight text-[#111]" style={{ fontFamily: "'Montserrat', sans-serif" }}>Cuidar da liderança também protege a cultura.</h3>
          <p className="text-[#666] font-medium">O equilíbrio emocional da liderança influencia diretamente a forma como pressão, clareza e segurança psicológica circulam na organização.</p>
          <button onClick={() => navigate('/enterprise/rh/lideranca')} className="w-full bg-[#F88A2B] text-[#111] py-4 rounded-full font-bold uppercase tracking-widest transition-transform active:scale-95 shadow-lg shadow-orange-500/20">
            Ver visão executiva
          </button>
          <button onClick={() => navigate('/enterprise/rh')} className="block mx-auto text-[#999] hover:text-[#F88A2B] font-bold uppercase tracking-widest text-[10px] transition-colors">
            Voltar ao módulo RH
          </button>
        </section>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseLeadershipHealthScreen;