import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  MapPin, 
  Users, 
  Globe, 
  Activity, 
  Plus, 
  Settings, 
  ChevronRight, 
  ShieldCheck, 
  Building2, 
  Network,
  BarChart3,
  Search,
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Layout,
  Brain,
  MessageSquare,
  Star
} from "lucide-react";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";

const EnterpriseUnitsScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [showToast, setShowToast] = useState(false);
  const [formData, setFormData] = useState({ name: "", address: "" });
  const [units, setUnits] = useState<Array<{ id: string; name: string; type: string; employees: number; status: string; indicator: string; statusColor: string }>>([]);

  const load = async () => {
    if (!organization?.id) return;
    const [unitsRes, profilesRes] = await Promise.all([
      supabase.from("units").select("id,name,address").eq("organization_id", organization.id).order("name"),
      supabase.from("profiles").select("unit_id").eq("organization_id", organization.id),
    ]);
    const counts = new Map<string, number>();
    (profilesRes.data ?? []).forEach((p: { unit_id: string | null }) => {
      if (p.unit_id) counts.set(p.unit_id, (counts.get(p.unit_id) ?? 0) + 1);
    });
    setUnits(
      (unitsRes.data ?? []).map((u: { id: string; name: string; address: string | null }) => ({
        id: u.id,
        name: u.name,
        type: u.address ?? "Unidade",
        employees: counts.get(u.id) ?? 0,
        status: "Ativa",
        indicator: "Sinais coletivos em construção",
        statusColor: "bg-emerald-500",
      })),
    );
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const handleAddUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id || !formData.name.trim()) return;
    const { error } = await supabase.from("units").insert({
      organization_id: organization.id,
      name: formData.name,
      address: formData.address || null,
    });
    if (error) return;
    setFormData({ name: "", address: "" });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
    load();
  };

  return (
    <EnterpriseRHLayout title="Unidades">
    <div className="min-h-screen min-h-[100dvh] bg-[#F7F4F2] font-['Montserrat'] text-[#0B0908] overflow-y-auto pb-32 selection:bg-[#F88A2B]/20">
      {/* Toast Notification */}
      <div className={`fixed top-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-500 ${showToast ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0 pointer-events-none'}`}>
        <div className="bg-[#0B0908] text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 border border-white/10 backdrop-blur-xl">
          <div className="w-2 h-2 rounded-full bg-[#F88A2B] animate-pulse" />
          <span className="text-sm font-medium">Unidade criada com segurança.</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="group p-3 bg-white rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
            >
              <ArrowLeft className="w-5 h-5 text-[#0B0908] group-hover:text-[#F88A2B] transition-colors" />
            </button>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="px-3 py-1 bg-[#F88A2B]/10 text-[#F88A2B] text-[10px] font-bold uppercase tracking-wider rounded-full border border-[#F88A2B]/20">
                  Estrutura regional
                </span>
              </div>
              <h1 className="text-2xl font-['Playfair_Display'] font-bold text-[#0B0908]">
                Unidades organizacionais
              </h1>
            </div>
          </div>
        </header>

        {/* Hero Card */}
        <section className="mb-12">
          <div className="relative overflow-hidden bg-[#0B0908] rounded-[2.5rem] p-8 sm:p-12 shadow-2xl">
            {/* Abstract Background Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F88A2B]/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-[#F88A2B]/5 blur-[80px] rounded-full translate-y-1/2 -translate-x-1/4" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6 backdrop-blur-sm">
                  <Sparkles className="w-3.5 h-3.5 text-[#F88A2B]" />
                  <span className="text-white/60 text-[10px] uppercase tracking-[0.2em] font-medium">Estrutura viva</span>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-['Playfair_Display'] font-bold text-white mb-6 leading-tight">
                  Cada unidade possui seu próprio ritmo emocional coletivo.
                </h2>
                <p className="text-white/60 text-base sm:text-lg leading-relaxed font-light">
                  O Enterprise ajuda organizações distribuídas a entender diferentes contextos culturais mantendo uma visão organizacional integrada.
                </p>
              </div>
              <div className="hidden lg:block">
                <div className="w-64 h-64 relative">
                  <div className="absolute inset-0 bg-[#F88A2B]/20 blur-[40px] rounded-full animate-pulse" />
                  <div className="relative w-full h-full border border-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <div className="w-4/5 h-4/5 border border-white/5 rounded-full flex items-center justify-center">
                      <Network className="w-20 h-20 text-white/20" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {[
            { label: "Unidades ativas", value: "12", icon: Building2 },
            { label: "Regiões organizacionais", value: "5", icon: Globe },
            { label: "Colaboradores distribuídos", value: "842", icon: Users },
            { label: "Implantação média", value: "91%", icon: Activity },
          ].map((kpi, idx) => (
            <div key={idx} className="bg-white p-6 rounded-[2rem] shadow-sm border border-black/5 hover:shadow-md transition-all group">
              <div className="w-10 h-10 bg-[#F7F4F2] rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <kpi.icon className="w-5 h-5 text-[#F88A2B]" />
              </div>
              <div className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#0B0908] mb-1 leading-none">
                {kpi.value}
              </div>
              <div className="text-[10px] text-[#0B0908]/40 uppercase tracking-widest font-semibold">
                {kpi.label}
              </div>
            </div>
          ))}
        </section>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Units List */}
          <div className="lg:col-span-2 space-y-12">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#0B0908]">
                  Unidades cadastradas
                </h3>
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-[#0B0908]/30" />
                  <input 
                    type="text" 
                    placeholder="Buscar unidade..." 
                    className="pl-10 pr-4 py-2 bg-white rounded-xl text-sm border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 w-48 sm:w-64 transition-all"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {units.map((unit) => (
                  <div key={unit.id} className="bg-white p-6 rounded-[2rem] border border-black/5 hover:shadow-xl transition-all group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/5 blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-[#F88A2B]/10 transition-colors" />
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${unit.status === 'Ativa' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {unit.status}
                      </div>
                      <div className="flex gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </div>
                    </div>

                    <h4 className="text-lg font-['Playfair_Display'] font-bold text-[#0B0908] mb-1">
                      {unit.name}
                    </h4>
                    <p className="text-xs text-[#0B0908]/40 mb-6 uppercase tracking-wider font-medium">
                      {unit.type}
                    </p>

                    <div className="space-y-4 mb-8">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[#0B0908]/50">Colaboradores</span>
                        <span className="font-semibold text-[#0B0908]">{unit.employees}</span>
                      </div>
                      <div className="p-3 bg-[#F7F4F2] rounded-xl border border-black/5">
                        <div className="flex items-center gap-2 mb-1">
                          <Activity className="w-3.5 h-3.5 text-[#F88A2B]" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40">Indicador</span>
                        </div>
                        <p className="text-xs font-medium text-[#0B0908]">
                          {unit.indicator}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button className="py-2.5 px-4 bg-[#0B0908] text-white text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-[#F88A2B] transition-colors shadow-lg shadow-black/10">
                        Acessar
                      </button>
                      <button className="py-2.5 px-4 bg-[#F7F4F2] text-[#0B0908] text-[11px] font-bold uppercase tracking-widest rounded-xl hover:bg-white border border-black/5 transition-colors">
                        Insights
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Organizational Map Visual */}
            <section>
              <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#0B0908] mb-8">
                Mapa organizacional
              </h3>
              <div className="bg-white rounded-[2.5rem] p-12 aspect-[16/9] relative overflow-hidden border border-black/5 flex items-center justify-center group">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#F7F4F2_0%,_transparent_70%)]" />
                
                {/* Abstrat connection lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 400">
                  <path d="M200,200 Q400,100 600,200" fill="none" stroke="#F88A2B" strokeWidth="1" strokeDasharray="5,5" />
                  <path d="M200,200 Q400,300 600,200" fill="none" stroke="#F88A2B" strokeWidth="1" strokeDasharray="5,5" />
                  <path d="M300,100 Q400,200 500,300" fill="none" stroke="#F88A2B" strokeWidth="1" strokeDasharray="5,5" />
                </svg>

                {/* Abstract Glowing Nodes */}
                <div className="relative flex items-center justify-center w-full h-full">
                  {[
                    { t: '15%', l: '20%', s: 'w-4 h-4' },
                    { t: '45%', l: '25%', s: 'w-6 h-6' },
                    { t: '75%', l: '35%', s: 'w-4 h-4' },
                    { t: '20%', l: '50%', s: 'w-8 h-8' },
                    { t: '60%', l: '55%', s: 'w-5 h-5' },
                    { t: '35%', l: '75%', s: 'w-6 h-6' },
                    { t: '80%', l: '80%', s: 'w-3 h-3' },
                  ].map((node, i) => (
                    <div 
                      key={i}
                      className={`absolute ${node.s} bg-[#F88A2B] rounded-full shadow-[0_0_20px_#F88A2B] group-hover:scale-125 transition-transform duration-1000`}
                      style={{ top: node.t, left: node.l, animationDelay: `${i * 0.5}s` }}
                    />
                  ))}
                  <div className="text-center z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0B0908] text-white rounded-full text-xs font-bold tracking-widest uppercase mb-4 shadow-2xl">
                      <Globe className="w-3.5 h-3.5 text-[#F88A2B]" />
                      Ecossistema organizacional
                    </div>
                    <p className="text-[#0B0908]/40 text-sm max-w-xs mx-auto">
                      Conexões culturais e fluxos emocionais entre as unidades da empresa.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Regional Insights */}
            <section className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Operações", value: "Maior aceleração cognitiva", icon: Brain },
                { label: "Atendimento", value: "Estabilidade crescente", icon: MessageSquare },
                { label: "Liderança regional", value: "Boa adaptação cultural", icon: Star },
                { label: "Unidade internacional", value: "Onboarding positivo", icon: Globe },
              ].map((insight, idx) => (
                <div key={idx} className="bg-white p-6 rounded-[2rem] border border-black/5 flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#F7F4F2] rounded-xl flex items-center justify-center shrink-0">
                    <insight.icon className="w-5 h-5 text-[#F88A2B]" />
                  </div>
                  <div>
                    <h5 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0B0908]/40 mb-1">
                      {insight.label}
                    </h5>
                    <p className="text-sm font-semibold text-[#0B0908]">
                      {insight.value}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Right Column: Actions and Forms */}
          <div className="space-y-8">
            {/* Add Unit Form */}
            <section className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/40 shadow-xl sticky top-8">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-[#F88A2B] rounded-xl flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-['Playfair_Display'] font-bold">
                  Adicionar unidade
                </h3>
              </div>

              <form onSubmit={handleAddUnit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2 ml-1">
                    Nome da unidade
                  </label>
                  <input 
                    type="text" 
                    placeholder="Ex: São Paulo - Hub"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-5 py-3.5 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all text-sm"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2 ml-1">
                      Cidade/Região
                    </label>
                    <input 
                      type="text" 
                      placeholder="Cidade"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-5 py-3.5 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2 ml-1">
                      País
                    </label>
                    <input 
                      type="text" 
                      placeholder="País"
                      className="w-full px-5 py-3.5 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2 ml-1">
                    Tipo da unidade
                  </label>
                  <select className="w-full px-5 py-3.5 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all text-sm appearance-none cursor-pointer">
                    <option value="matriz">Matriz</option>
                    <option value="filial">Filial</option>
                    <option value="operacao">Operação</option>
                    <option value="hub">Hub Regional</option>
                    <option value="internacional">Internacional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2 ml-1">
                    Líder responsável
                  </label>
                  <input 
                    type="text" 
                    placeholder="Nome do responsável"
                    className="w-full px-5 py-3.5 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all text-sm"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 mb-2 ml-1">
                    Estimativa de colaboradores
                  </label>
                  <input 
                    type="number" 
                    placeholder="0"
                    className="w-full px-5 py-3.5 bg-white rounded-2xl border border-black/5 focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/20 transition-all text-sm"
                    required
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full py-4 bg-[#F88A2B] text-white font-bold uppercase tracking-widest rounded-2xl hover:bg-[#F88A2B]/90 transition-all shadow-lg shadow-[#F88A2B]/20 active:scale-[0.98]"
                >
                  Adicionar unidade
                </button>
              </form>
            </section>

            {/* Privacy Card */}
            <section className="bg-[#0B0908] rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#F88A2B]/10 blur-3xl rounded-full" />
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">Leitura coletiva protegida</span>
                </div>
                <h4 className="text-xl font-['Playfair_Display'] font-bold mb-4">
                  Unidades não revelam experiências individuais.
                </h4>
                <p className="text-white/50 text-xs leading-relaxed mb-6 font-light">
                  O Enterprise mostra apenas tendências coletivas agregadas por região ou unidade.
                </p>
                <div className="space-y-3">
                  {[
                    "Sem emoções individuais",
                    "Sem conversas IA",
                    "Sem scores pessoais",
                    "Anonimização automática regional"
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#F88A2B]" />
                      <span className="text-xs text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Governance Timeline */}
            <section className="bg-white p-8 rounded-[2.5rem] border border-black/5">
              <h4 className="text-sm font-bold uppercase tracking-widest text-[#0B0908] mb-8">
                Governança distribuída
              </h4>
              <div className="space-y-8">
                {[
                  { title: "Unidades possuem líderes locais", icon: Users },
                  { title: "Dados são agregados regionalmente", icon: BarChart3 },
                  { title: "A organização mantém visão integrada", icon: Layout },
                  { title: "A cultura evolui de forma coordenada", icon: Sparkles },
                ].map((step, idx) => (
                  <div key={idx} className="flex gap-4 relative">
                    {idx !== 3 && (
                      <div className="absolute left-4 top-8 w-px h-10 bg-black/5" />
                    )}
                    <div className="w-8 h-8 rounded-lg bg-[#F7F4F2] flex items-center justify-center shrink-0 border border-black/5 relative z-10">
                      <step.icon className="w-4 h-4 text-[#F88A2B]" />
                    </div>
                    <div className="pt-1.5">
                      <h5 className="text-xs font-semibold text-[#0B0908]">{step.title}</h5>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Global CTAs */}
        <section className="mt-20 py-12 border-t border-black/5 flex flex-col items-center gap-6">
          <button 
            onClick={() => setShowToast(true)}
            className="group relative px-12 py-5 bg-[#F88A2B] text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-sm overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-xl shadow-[#F88A2B]/20"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <span className="relative flex items-center gap-3">
              <Plus className="w-5 h-5" />
              Criar nova unidade
            </span>
          </button>
          <button 
            onClick={() => navigate('/enterprise/rh/organizacoes')}
            className="px-8 py-3 text-[#0B0908]/50 hover:text-[#0B0908] font-bold uppercase tracking-widest text-[11px] transition-colors"
          >
            Voltar para organizações
          </button>
          
          <div className="flex flex-col items-center gap-4 text-[#0B0908]/30">
            <p className="text-[10px] font-medium tracking-widest uppercase">
              Cada unidade contribui para a construção emocional coletiva da organização.
            </p>
          </div>
        </section>
      </div>
    </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseUnitsScreen;
