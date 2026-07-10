import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
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

const InputField = ({ label, value, onChange, icon: Icon, readOnly = false, type = "text" }: { label: string; value: string; onChange?: (v: string) => void; icon: any; readOnly?: boolean; type?: string }) => (
  <div className="rounded-3xl p-5 bg-white border border-white/60 shadow-[0_4px_20px_rgb(0,0,0,0.02)] flex flex-col gap-1.5 transition-all hover:shadow-md">
    <span className="text-[11px] font-bold text-[#999] uppercase tracking-wider">{label}</span>
    <div className="flex items-center gap-3">
      <div className="h-8 w-8 rounded-xl bg-[#F7F4F2] flex items-center justify-center shrink-0">
        <Icon className="h-4 w-4 text-[#666]" />
      </div>
      <input 
        type={type}
        value={value} 
        onChange={(e) => onChange?.(e.target.value)}
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
  const { organization } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [licensesTotal, setLicensesTotal] = useState(0);
  const [licensesUsed, setLicensesUsed] = useState(0);
  const [responsibleName, setResponsibleName] = useState("");
  const [responsibleEmail, setResponsibleEmail] = useState("");
  const [frequency, setFrequency] = useState("Semanal");
  const [minGroupSize, setMinGroupSize] = useState<number>(5);
  const [channelName, setChannelName] = useState("");
  const [channelEmail, setChannelEmail] = useState("");
  const [departments, setDepartments] = useState<Array<{ id: string; name: string }>>([]);
  const [newDept, setNewDept] = useState("");

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const [orgRes, settingsRes, depsRes] = await Promise.all([
      supabase.from("organizations").select("name,licenses_total,licenses_used,responsible_name,responsible_email").eq("id", organization.id).maybeSingle(),
      supabase.from("organization_settings").select("key,value").eq("organization_id", organization.id),
      supabase.from("departments").select("id,name").eq("organization_id", organization.id).order("name"),
    ]);
    if (orgRes.data) {
      setOrgName(orgRes.data.name ?? "");
      setLicensesTotal(orgRes.data.licenses_total ?? 0);
      setLicensesUsed(orgRes.data.licenses_used ?? 0);
      setResponsibleName(orgRes.data.responsible_name ?? "");
      setResponsibleEmail(orgRes.data.responsible_email ?? "");
    }
    const map = new Map<string, any>();
    (settingsRes.data ?? []).forEach((s: any) => map.set(s.key, s.value));
    setFrequency(map.get("checkin_frequency")?.value ?? "Semanal");
    setMinGroupSize(Number(map.get("privacy_min_group_size")?.value ?? 5));
    setChannelName(map.get("direct_channel")?.responsible ?? "");
    setChannelEmail(map.get("direct_channel")?.email ?? "");
    setDepartments(depsRes.data ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const upsertSetting = async (key: string, value: any) => {
    if (!organization?.id) return;
    await supabase.from("organization_settings").upsert(
      { organization_id: organization.id, key, value },
      { onConflict: "organization_id,key" }
    );
  };

  const handleSave = async () => {
    if (!organization?.id) return;
    setSaving(true);
    const { error: orgErr } = await supabase.from("organizations").update({
      responsible_name: responsibleName,
      responsible_email: responsibleEmail,
    }).eq("id", organization.id);
    if (orgErr) {
      toast.error(orgErr.message);
      setSaving(false);
      return;
    }
    await Promise.all([
      upsertSetting("checkin_frequency", { value: frequency }),
      upsertSetting("privacy_min_group_size", { value: minGroupSize }),
      upsertSetting("direct_channel", { responsible: channelName, email: channelEmail }),
    ]);
    toast.success("Configurações salvas com segurança.");
    setSaving(false);
  };

  const handleAddDept = async () => {
    if (!newDept.trim() || !organization?.id) return;
    const { error } = await supabase.from("departments").insert({
      organization_id: organization.id,
      name: newDept.trim(),
    });
    if (error) return toast.error(error.message);
    setNewDept("");
    load();
  };

  const handleRemoveDept = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
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
          <InputField label="Nome da empresa" value={orgName} icon={Building2} readOnly />
          <InputField label="Licenças" value={`${licensesUsed} / ${licensesTotal}`} icon={Users} readOnly />
          <InputField label="Responsável RH" value={responsibleName} onChange={setResponsibleName} icon={User} />
          <InputField label="E-mail de contato" value={responsibleEmail} onChange={setResponsibleEmail} icon={Mail} />
        </Section>

        {/* Departamentos */}
        <Section title="Departamentos">
          <div className="space-y-3">
            {departments.map((dept) => (
              <div key={dept.id} className="rounded-2xl p-4 bg-white border border-white/60 shadow-sm flex items-center justify-between group transition-all hover:border-[#F88A2B44]">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-[#F88A2B]" />
                  <span className="text-[15px] font-medium text-[#111]">{dept.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveDept(dept.id)}
                  className="h-8 w-8 flex items-center justify-center text-[#999] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="Nome da nova área"
                className="flex-1 rounded-2xl border border-white/60 bg-white px-4 py-3 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/30"
              />
              <button
                onClick={handleAddDept}
                className="px-4 py-3 rounded-2xl border border-dashed border-[#F88A2B44] text-[#F88A2B] font-bold text-[14px] flex items-center gap-2 bg-white transition-all active:scale-[0.98]"
              >
                <Plus className="h-4 w-4" />
                Adicionar
              </button>
            </div>
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
              <div className="bg-white px-3 py-2 rounded-xl shadow-sm border border-white/60 flex items-center gap-2">
                <input
                  type="number"
                  min={3}
                  max={50}
                  value={minGroupSize}
                  onChange={(e) => setMinGroupSize(Math.max(3, Number(e.target.value) || 5))}
                  className="w-14 text-[16px] font-bold text-[#F88A2B] bg-transparent border-none focus:outline-none text-right"
                />
                <span className="text-[12px] font-bold text-[#999] uppercase tracking-tighter">pessoas</span>
              </div>
            </div>
          </div>
        </Section>

        {/* Canal Direto RH */}
        <Section title="Canal Direto RH">
          <div className="space-y-4">
            <InputField label="RH responsável pelo canal" value={channelName} onChange={setChannelName} icon={User} />
            <InputField label="E-mail de recebimento" value={channelEmail} onChange={setChannelEmail} icon={Mail} type="email" />
            
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
            {saving ? "Salvando..." : "Salvar configurações"}
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
