import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  LayoutDashboard, 
  Zap
} from "lucide-react";
import { motion } from "framer-motion";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const EnterpriseCapacityPulseScreen = () => {
  const navigate = useNavigate();

  const metrics = [
    { label: "Capacidade Geral", value: "78%", status: "saudável" },
    { label: "Risco de Burnout", value: "12%", status: "baixo" },
    { label: "Energia do Time", value: "Alta", status: "positivo" },
    { label: "Foco Coletivo", value: "82%", status: "positivo" },
  ];

  return (
    <EnterpriseRHLayout title="Pulso de Capacidade">
      <div className="space-y-8 animate-fade-in bg-white -mx-6 lg:mx-0 px-6 lg:px-0 pb-20">
        <section>
          <div className="rounded-[32px] bg-white border border-black/5 p-8 md:p-12 relative overflow-hidden text-[#111] shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.05] rounded-full -translate-y-20 translate-x-20 blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="h-4 w-4 text-[#F88A2B]" />
                <span className="px-3 py-1.5 rounded-full bg-black/5 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-black/5">Tempo Real Coletivo</span>
              </div>
              <h2 className="text-[32px] md:text-[42px] leading-tight font-extrabold mb-4 tracking-tight" style={{ fontFamily: "'Montserrat', sans-serif" }}>
                Sinta o ritmo da sua organização.
              </h2>
              <p className="text-[15px] md:text-[18px] leading-relaxed text-[#666] mb-8 max-w-2xl font-medium">
                O pulso de capacidade identifica se o time está operando em fluxo ou se há sinais de exaustão iminente.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white p-6 rounded-3xl border border-black/5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <p className="text-[10px] font-bold uppercase tracking-widest text-black/40 mb-2">{m.label}</p>
              <p className="text-[32px] font-extrabold text-[#111] tracking-tighter" style={{ fontFamily: "'Montserrat', sans-serif" }}>{m.value}</p>
              <div className="mt-2 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">{m.status}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-white rounded-[40px] p-10 border border-white/60 shadow-sm">
          <h3 className="text-xl font-playfair italic mb-8">Fluxo de energia semanal</h3>
          <div className="h-64 flex items-end justify-between gap-4 px-4 border-b border-[#F7F4F2] pb-2">
            {[
              { h: 60, p: 40, label: "SEG" },
              { h: 45, p: 35, label: "TER" },
              { h: 80, p: 70, label: "QUA" },
              { h: 55, p: 45, label: "QUI" },
              { h: 70, p: 60, label: "SEX" },
              { h: 90, p: 85, label: "SÁB" },
              { h: 65, p: 30, label: "DOM" }
            ].map((item, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                <div className="w-full bg-[#F88A2B]/10 rounded-t-xl relative overflow-hidden group" style={{ height: `${item.h}%` }}>
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: "100%" }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 1 }}
                    className="absolute bottom-0 w-full bg-[#F88A2B]/30 rounded-t-xl"
                  />
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${(item.p / item.h) * 100}%` }}
                    transition={{ delay: 0.5 + i * 0.1, duration: 1.2 }}
                    className="absolute bottom-0 w-full bg-[#F88A2B] rounded-t-xl shadow-[0_-4px_12px_rgba(248,138,43,0.2)]" 
                  />
                </div>
                <span className="text-[9px] font-bold text-black/30 uppercase tracking-tighter">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/dashboard')}
            variant="secondary"
            icon={LayoutDashboard}
          >
            Voltar ao Dashboard
          </EnterpriseRHButton>
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh/relatorio')}
            icon={BarChart3}
          >
            Relatório Detalhado
          </EnterpriseRHButton>
        </section>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseCapacityPulseScreen;