import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, ShieldCheck, Check, Lock, Users, BarChart3, Fingerprint, EyeOff, 
  AlertCircle, MessageSquare, Building2, Info, FileText, ExternalLink, ChevronRight
} from "lucide-react";
import logoMark from "@/assets/login-abstract.png";
import { EnterpriseUserLayout } from "./layouts/EnterpriseUserLayout";
import { motion } from "framer-motion";

const ORANGE = "#F88A2B";

const ListItem = ({ children, icon: Icon = Check }: { children: React.ReactNode; icon?: any }) => (
  <li className="flex items-start gap-3 text-sm leading-relaxed text-[#444]">
    <span
      className="mt-[3px] flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#F88A2B1A]"
    >
      <Icon className="h-3 w-3" style={{ color: ORANGE }} strokeWidth={Icon === Check ? 3 : 2} />
    </span>
    <span>{children}</span>
  </li>
);

const SectionCard = ({
  title,
  children,
  icon,
  className = "",
  dark = false,
}: {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
  dark?: boolean;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`relative overflow-hidden rounded-[32px] p-8 transition-all duration-300 ${
      dark 
        ? "bg-[#0B0908] text-white shadow-2xl" 
        : "bg-white border border-black/5 shadow-sm hover:shadow-md hover:border-[#F88A2B]/10"
    } ${className}`}
  >
    <div className="mb-6 flex items-center gap-4">
      {icon && (
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
            dark ? "bg-white/10 text-white" : "bg-orange-50 text-[#F88A2B]"
          }`}
        >
          {icon}
        </div>
      )}
      <h3
        className={`text-xl font-bold ${dark ? "text-white" : "text-[#111]"}`}
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {title}
      </h3>
    </div>
    <div className={dark ? "text-white/80" : "text-[#444]"}>
      {children}
    </div>
  </motion.div>
);

export default function PrivacyEnterpriseScreen() {
  const navigate = useNavigate();

  return (
    <EnterpriseUserLayout title="Centro de Privacidade">
      <div className="max-w-6xl mx-auto pb-24 space-y-10">
        
        {/* SaaS Header Section */}
        <section className="bg-white rounded-[32px] p-8 lg:p-12 shadow-sm border border-black/5 flex flex-col lg:flex-row items-center gap-10">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-[#F88A2B] text-[10px] font-bold uppercase tracking-widest">
              <ShieldCheck size={12} fill="currentColor" /> Privacidade por Design
            </div>
            <h1 className="text-4xl lg:text-5xl font-playfair font-bold text-[#111] leading-tight">
              Privacidade não é detalhe.<br />
              <span className="text-[#F88A2B]">É a base da nossa confiança.</span>
            </h1>
            <p className="text-base text-[#666] leading-relaxed max-w-2xl">
              O ecossistema Enterprise foi arquitetado sob o princípio do anonimato. Criamos ferramentas para cuidar da saúde emocional do time sem nunca expor a individualidade do colaborador.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <button 
                onClick={() => navigate("/enterprise/minha-privacidade")}
                className="px-8 py-4 bg-[#F88A2B] text-white text-sm font-bold rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-[1.02] transition-all"
              >
                Meus dados & LGPD
              </button>
              <button className="px-8 py-4 bg-white text-[#111] text-sm font-bold rounded-2xl border border-black/5 hover:bg-black/5 transition-all flex items-center gap-2">
                Baixar Política Completa <FileText size={16} />
              </button>
            </div>
          </div>
          
          <div className="hidden lg:flex w-72 bg-[#0B0908] rounded-[3rem] p-8 text-white relative overflow-hidden shadow-2xl shrink-0 flex-col items-center justify-center text-center">
             <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/20 blur-3xl rounded-full -mr-16 -mt-16" />
             <div className="w-20 h-20 rounded-[2rem] bg-white/10 flex items-center justify-center mb-6 backdrop-blur-xl border border-white/10">
                <Lock className="text-[#F88A2B]" size={32} />
             </div>
             <p className="text-lg font-bold mb-2 font-playfair">Dados Criptografados</p>
             <p className="text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">Padrão Bancário de Segurança de Dados</p>
          </div>
        </section>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Section 1: O RH nunca vê */}
          <SectionCard 
            title="O RH nunca vê" 
            icon={<EyeOff size={24} />}
          >
            <p className="text-xs text-[#8A8A8A] mb-6 uppercase tracking-widest font-bold">Privacidade Total</p>
            <ul className="space-y-4">
              <ListItem>Suas respostas individuais aos check-ins</ListItem>
              <ListItem>Suas conversas privadas com o Cury Digital (IA)</ListItem>
              <ListItem>Seu perfil emocional detalhado</ListItem>
              <ListItem>Seu histórico de consumo de conteúdos</ListItem>
              <ListItem>Sua trilha de desenvolvimento individual</ListItem>
            </ul>
          </SectionCard>

          {/* Section 2: O RH vê apenas */}
          <SectionCard 
            title="O RH vê apenas" 
            icon={<BarChart3 size={24} />}
          >
            <p className="text-xs text-[#8A8A8A] mb-6 uppercase tracking-widest font-bold">Insights Estratégicos</p>
            <ul className="space-y-4 mb-8">
              <ListItem icon={Users}>Tendências coletivas e agregadas</ListItem>
              <ListItem icon={BarChart3}>Nível de equilíbrio geral do time</ListItem>
              <ListItem icon={AlertCircle}>Alertas de sobrecarga por área (anonimizado)</ListItem>
              <ListItem icon={Check}>Taxa de adesão e engajamento coletivo</ListItem>
            </ul>
            
            <div className="bg-[#F9F8F6] rounded-2xl p-4 border border-black/5">
              <div className="flex items-end gap-1.5 h-16">
                {[30, 60, 45, 85, 50, 75, 40, 90].map((h, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ delay: i * 0.1, duration: 1 }}
                    className="flex-1 rounded-t-lg bg-[#F88A2B]/20" 
                  />
                ))}
              </div>
              <p className="text-[10px] text-center text-[#8A8A8A] mt-3 uppercase tracking-widest font-bold">Exemplo de Visão Agregada</p>
            </div>
          </SectionCard>

          {/* Section 3: Anonimato Automático */}
          <SectionCard 
            title="Volume Mínimo de Proteção" 
            icon={<ShieldCheck size={24} />}
            className="md:col-span-1"
          >
            <p className="text-sm leading-relaxed text-[#666] mb-6">
              Para garantir que ninguém seja identificado, o sistema não gera relatórios para departamentos ou subgrupos com menos de <strong>5 colaboradores ativos</strong>.
            </p>
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-orange-50/50 border border-orange-100">
               <Info size={20} className="text-[#F88A2B] shrink-0" />
               <p className="text-[11px] font-bold text-[#F88A2B]/80 uppercase tracking-wider">Algoritmo de Proteção de Identidade Ativo</p>
            </div>
          </SectionCard>

          {/* Section 4: Canal Direto */}
          <SectionCard 
            title="Situações Sensíveis" 
            dark
            icon={<Fingerprint size={24} />}
          >
            <p className="text-sm leading-relaxed text-white/70 mb-6">
              Assuntos como assédio ou conflitos diretos não são tabulados em dashboards. Para isso, você tem o Canal Direto RH com criptografia ponta-a-ponta.
            </p>
            <button 
              onClick={() => navigate('/enterprise/sos-rh')}
              className="w-full py-4 rounded-xl bg-white/10 border border-white/20 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2"
            >
              Acessar Canal Seguro <ChevronRight size={14} />
            </button>
          </SectionCard>
        </div>

        {/* Footer Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
           {[
             { label: 'Termos de Uso', to: '/enterprise/terms' },
             { label: 'Política de Cookies', to: '/enterprise/cookies' },
             { label: 'Gerenciar Dados', to: '/enterprise/settings' }
           ].map(item => (
             <button key={item.label} className="p-5 bg-white rounded-2xl border border-black/5 text-xs font-bold text-[#111] hover:bg-[#F9F8F6] transition-all flex items-center justify-between">
               {item.label} <ExternalLink size={14} className="text-[#B8B0A8]" />
             </button>
           ))}
        </div>

        <div className="text-center pt-10">
          <p className="text-[10px] font-bold text-[#B8B0A8] uppercase tracking-widest">Enterprise RH · Central de Privacidade · v1.2.0</p>
        </div>
      </div>
    </EnterpriseUserLayout>
  );
}