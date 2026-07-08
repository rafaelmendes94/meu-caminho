import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  Save, 
  Plus, 
  Lock,
  Mail,
  User,
  Trash2,
  Database,
  ChevronRight,
  Settings
} from "lucide-react";
import { toast } from "sonner";
import { EnterpriseRHLayout, EnterpriseRHButton } from "./EnterpriseRHNavigation";

const BG = "#F7F4F2";
const ORANGE = "#F88A2B";
const DARK_BG = "#0B0908";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="space-y-4">
    <h3 className="text-[14px] font-bold text-[#999] uppercase tracking-widest px-1">
      {title}
    </h3>
    <div className="space-y-3">
      {children}
    </div>
  </section>
);

const InputField = ({ label, value, icon: Icon, readOnly = false }: { label: string; value: string; icon: any; readOnly?: boolean }) => (
  <div className="rounded-3xl p-5 bg-white border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col gap-1.5 transition-all hover:shadow-md">
    <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider">{label}</span>
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-xl bg-[#F7F4F2] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#666]" />
      </div>
      <input 
        type="text" 
        value={value} 
        readOnly={readOnly}
        className="bg-transparent border-none focus:outline-none text-[#111] font-medium text-[15px] w-full"
      />
    </div>
  </div>
);

const FrequencyOption = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-4 px-4 rounded-2xl border transition-all text-[14px] font-bold ${
      selected 
        ? "bg-[#F88A2B] border-[#F88A2B] text-[#111] shadow-lg shadow-[#F88A2B]/20" 
        : "bg-white border-white/60 text-[#666] shadow-sm"
    }`}
  >
    {label}
  </button>
);

export default function EnterpriseCompanySettingsScreen() {
  const navigate = useNavigate();
  const [frequency, setFrequency] = useState("Semanal");
  const [departments, setDepartments] = useState([
    "Comercial",
    "Operações",
    "Produto",
    "Atendimento",
    "Tecnologia"
  ]);

  const handleSave = () => {
    toast.success("Configurações salvas com segurança.");
  };

  return (
    <EnterpriseRHLayout title="Configurações Enterprise">
      <div className="space-y-10 animate-fade-in py-2">
        
        {/* Hero Card */}
        <section>
          <div className="rounded-[40px] bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] p-8 md:p-10 relative overflow-hidden text-[#111] shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F88A2B] opacity-[0.1] rounded-full -translate-y-32 translate-x-32 blur-3xl" />
            
            <div className="relative z-10">
              <div className="h-12 w-12 rounded-2xl bg-black/5 flex items-center justify-center mb-6">
                <Settings className="h-6 w-6 text-[#F88A2B]" />
              </div>
              
              <h2 className="text-[32px] md:text-[36px] leading-[1.1] font-bold mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                Configure o cuidado coletivo com segurança.
              </h2>
              
              <p className="text-[15px] leading-relaxed text-[#666] max-w-[480px]">
                Defina áreas, frequência de check-in e regras de anonimato sem expor nenhum colaborador.
              </p>
            </div>
          </div>
        </section>

        {/* Empresa */}
        <Section title="Empresa">
          <InputField label="Nome da empresa" value="Instituto Augusto Cury" icon={Building2} readOnly />
          <InputField label="Número de colaboradores" value="250 colaboradores" icon={Users} readOnly />
          <InputField label="Responsável RH" value="Rafael Oliveira" icon={User} />
          <InputField label="E-mail de contato" value="rafael.oliveira@instituto.com.br" icon={Mail} />
        </Section>

        {/* Departamentos */}
        <Section title="Departamentos">
          <div className="space-y-3">
            {departments.map((dept, index) => (
              <div key={index} className="rounded-2xl p-4 bg-white border border-white/60 shadow-sm flex items-center justify-between group transition-all hover:border-[#F88A2B44]">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#F88A2B]" />
                  <span className="text-[15px] font-medium text-[#111]">{dept}</span>
                </div>
                <button className="h-8 w-8 flex items-center justify-center text-[#999] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button className="w-full py-4 rounded-2xl border border-dashed border-[#F88A2B44] text-[#F88A2B] font-bold text-[14px] flex items-center justify-center gap-2 bg-white transition-all active:scale-[0.98]">
              <Plus className="h-4 w-4" />
              <span>Adicionar área</span>
            </button>
          </div>
        </Section>

        {/* Frequência */}
        <Section title="Frequência do check-in">
          <div className="flex gap-3">
            {["Semanal", "Quinzenal", "Mensal"].map((opt) => (
              <FrequencyOption 
                key={opt}
                label={opt}
                selected={frequency === opt}
                onClick={() => setFrequency(opt)}
              />
            ))}
          </div>
        </Section>

        {/* Proteção de anonimato */}
        <Section title="Proteção de anonimato">
          <div className="rounded-[32px] p-7 bg-white border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] space-y-5">
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-[#F88A2B1A] flex items-center justify-center shrink-0">
                <ShieldCheck className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <h4 className="text-[18px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
                Volume mínimo por grupo
              </h4>
            </div>
            
            <p className="text-[14px] text-[#666] leading-relaxed">
              Recortes por área só aparecem quando houver pessoas suficientes para proteger a identidade individual.
            </p>
            
            <div className="bg-[#F7F4F2] p-5 rounded-2xl border border-white flex items-center justify-between">
              <span className="text-[14px] font-bold text-[#111]">Mínimo de colaboradores</span>
              <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-white/60 flex items-center gap-2">
                <span className="text-[16px] font-bold text-[#F88A2B]">8</span>
                <span className="text-[12px] font-bold text-[#999] uppercase tracking-tighter">pessoas</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Canal Direto RH */}
        <Section title="Canal Direto RH">
          <div className="space-y-4">
            <InputField label="RH responsável pelo canal" value="Rafael Oliveira" icon={User} />
            <InputField label="E-mail de recebimento" value="canal.direto@instituto.com.br" icon={Mail} />
            
            <div className="rounded-[32px] p-6 bg-gradient-to-br from-[#F7F4F2] to-[#EFEAE5] border border-[#E5E0DA] text-[#111] text-[#111] border border-black/5 shadow-xl flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-black/5 flex items-center justify-center shrink-0">
                <Lock className="h-5 w-5 text-[#F88A2B]" />
              </div>
              <div className="space-y-1">
                <h5 className="text-[15px] font-bold">Confidencialidade garantida</h5>
                <p className="text-[13px] text-[#777] leading-relaxed">
                  Mensagens do Canal Direto são enviadas exclusivamente ao e-mail configurado e não entram em relatórios agregados.
                </p>
              </div>
            </div>
          </div>
        </Section>

        {/* Integração Avançada */}
        <section className="space-y-4">
          <h3 className="text-[14px] font-bold uppercase tracking-widest text-[#999] mb-5 px-2">Configurações Avançadas</h3>
          <div className="space-y-4">
            <button 
              onClick={() => navigate('/enterprise/rh/integracoes')}
              className="w-full p-6 rounded-[32px] bg-white border border-white/60 shadow-sm text-left flex items-center justify-between group active:scale-[0.99] transition-all"
            >
              <div className="flex items-center gap-5">
                <div className="h-14 w-14 rounded-2xl bg-[#F88A2B0D] flex items-center justify-center text-[#F88A2B] group-hover:bg-[#F88A2B1A] transition-colors">
                  <Database className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-[16px] font-bold text-[#111]">Integração & Estrutura</h4>
                  <p className="text-[13px] text-[#999]">Gestão de departamentos e API.</p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-[#CCC]" />
            </button>
          </div>
        </section>

        {/* Actions */}
        <section className="pt-6 space-y-3 pb-12">
          <EnterpriseRHButton 
            onClick={handleSave}
            icon={Save}
          >
            Salvar configurações
          </EnterpriseRHButton>
          
          <EnterpriseRHButton 
            onClick={() => navigate('/enterprise/rh')}
            variant="outline"
          >
            Voltar ao módulo RH
          </EnterpriseRHButton>
        </section>

      </div>
    </EnterpriseRHLayout>
  );
}
