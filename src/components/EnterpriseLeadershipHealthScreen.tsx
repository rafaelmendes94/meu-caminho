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
            { label: "Energia sustentável", value: "68%" },
            { label: "Sinais de sobrecarga", value: "41%" },
            { label: "Clareza emocional", value: "74%" },
            { label: "Recuperação coletiva", value: "+9%" },
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
          <p className="text-[#666] leading-relaxed font-medium">As lideranças demonstram boa percepção de clareza emocional, porém existe aumento gradual de aceleração mental em áreas sob maior pressão operacional.</p>
        </section>

        {/* Sinais Observados */}
        <section>
          <h3 className="font-extrabold text-xl mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Principais sinais observados</h3>
          <div className="space-y-4">
            {[
              "Dificuldade de desacelerar após ciclos intensos.",
              "Aumento de fadiga cognitiva em liderança operacional.",
              "Boa percepção de responsabilidade emocional.",
              "Necessidade maior de recuperação mental.",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-black/5 shadow-sm">
                <div className="w-8 h-8 rounded-full bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B]">
                  <Zap className="w-4 h-4" />
                </div>
                <p className="text-[#111] font-bold uppercase tracking-widest text-[11px]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Indicadores */}
        <section className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm">
          <h3 className="font-extrabold text-xl mb-8 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Indicadores emocionais</h3>
          <div className="space-y-6">
            {[
              "Clareza para decisão", "Energia emocional", "Equilíbrio mental", 
              "Recuperação cognitiva", "Percepção de apoio"
            ].map((label, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-sm font-bold uppercase tracking-widest text-[11px]">
                  <span className="text-[#666]">{label}</span>
                  <span className="text-[#F88A2B]">{(60 + i * 5)}%</span>
                </div>
                <div className="h-2 bg-[#F7F4F2] rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: `${60 + i * 5}%` }}
                    className="h-full bg-[#F88A2B]" 
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Fatores e Movimentos */}
        <div className="grid md:grid-cols-2 gap-8">
          <section>
            <h3 className="font-extrabold text-xl mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Fatores associados</h3>
            <ul className="space-y-3">
              {["Pressão contínua", "Excesso de ruído operacional", "Decisões em alta velocidade", "Baixa recuperação emocional", "Carga cognitiva elevada"].map((item, i) => (
                <li key={i} className="flex items-center gap-3 text-[#666] font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#F88A2B]" />
                  {item}
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h3 className="font-extrabold text-xl mb-6 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>Movimentos sugeridos</h3>
            <div className="grid grid-cols-1 gap-3">
              {["Criar pausas executivas estruturadas.", "Estimular recuperação cognitiva.", "Fortalecer espaços de escuta.", "Reduzir aceleração contínua."].map((item, i) => (
                <div key={i} className="p-4 bg-white border border-black/5 text-[#111] rounded-2xl text-sm font-bold shadow-sm uppercase tracking-wider text-[11px]">
                  {item}
                </div>
              ))}
            </div>
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