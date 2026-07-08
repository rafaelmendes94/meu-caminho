import React, { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  UserCircle2, 
  ShieldCheck, 
  MoreVertical, 
  Plus, 
  Edit2, 
  Trash2, 
  Briefcase, 
  BarChart3, 
  Lock,
  Search,
  Hash
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EnterpriseRHLayout } from "./EnterpriseRHNavigation";

interface Department {
  id: string;
  name: string;
  code: string;
  responsible: string;
  count: number;
  parent_id: string | null;
}

const EnterpriseDepartmentsScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  
  const [departments, setDepartments] = useState<Department[]>([]);

  const [form, setForm] = useState({
    name: "",
    code: "",
    responsible: "",
    count: "",
    parent_id: "",
  });

  const load = async () => {
    if (!organization?.id) return;
    const [depsRes, countsRes] = await Promise.all([
      supabase.from("departments").select("id,name,parent_id,leader_id").eq("organization_id", organization.id).order("name"),
      supabase.from("profiles").select("department_id").eq("organization_id", organization.id),
    ]);
    const counts = new Map<string, number>();
    (countsRes.data ?? []).forEach((p: { department_id: string | null }) => {
      if (p.department_id) counts.set(p.department_id, (counts.get(p.department_id) ?? 0) + 1);
    });
    setDepartments(
      (depsRes.data ?? []).map((d) => ({
        id: d.id,
        name: d.name,
        code: d.name.substring(0, 3).toUpperCase(),
        responsible: "—",
        count: counts.get(d.id) ?? 0,
        parent_id: d.parent_id,
      })),
    );
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const handleAddDepartment = async () => {
    if (!form.name) {
      toast.error("O nome do departamento é obrigatório.");
      return;
    }
    if (!organization?.id) return;
    const { error } = await supabase.from("departments").insert({
      organization_id: organization.id,
      name: form.name,
      parent_id: form.parent_id || null,
    });
    if (error) return toast.error(error.message);
    setForm({ name: "", code: "", responsible: "", count: "", parent_id: "" });
    toast.success("Departamento adicionado.");
    load();
  };

  const handleRemove = async (id: string) => {
    const { error } = await supabase.from("departments").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Departamento removido.");
    load();
  };

  const minVolume = 8;

  return (
    <EnterpriseRHLayout title="Departamentos">
      <div className="space-y-10 animate-fade-in py-2">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="rounded-full hover:bg-black/5"
          >
            <ArrowLeft className="w-6 h-6 text-[#0B0908]" />
          </Button>
          <h1 className="text-xl font-playfair font-bold text-[#0B0908]">
            Departamentos
          </h1>
        </div>
        <Badge className="bg-[#F88A2B] hover:bg-[#F88A2B] text-[#111] border-none px-3 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold">
          Estrutura organizacional
        </Badge>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white border border-black/5 text-[#111] rounded-3xl p-8 md:p-12 text-[#111] shadow-sm">
          {/* Amber Glow removed for white background consistency */}
          
          <div className="relative z-10 space-y-4">
            <h2 className="text-3xl md:text-4xl font-playfair font-bold leading-tight">
              Organize a empresa antes de ler seus sinais coletivos.
            </h2>
            <p className="text-[#666] text-sm md:text-base max-w-lg font-light leading-relaxed">
              Os departamentos ajudam o Enterprise a gerar recortes agregados, alertas e relatórios sem expor indivíduos.
            </p>
            
            <div className="pt-4 flex items-center gap-2">
              <div className="flex items-center gap-2 bg-black/5 backdrop-blur-md px-4 py-2 rounded-full border border-black/5">
                <ShieldCheck className="w-4 h-4 text-[#F88A2B]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#111]">Anonimização por grupo</span>
              </div>
            </div>
          </div>
        </section>

        {/* Adicionar Departamento */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <Plus className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Adicionar departamento</h3>
          </div>
          
          <div className="bg-white border border-black/5 p-8 rounded-[2rem] shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Nome do departamento</label>
                <Input 
                  placeholder="Ex: Operações" 
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B] font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Código interno (opcional)</label>
                <Input 
                  placeholder="Ex: OPS" 
                  value={form.code}
                  onChange={e => setForm({...form, code: e.target.value})}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B] font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Responsável (opcional)</label>
                <Input 
                  placeholder="Nome do líder ou RH responsável" 
                  value={form.responsible}
                  onChange={e => setForm({...form, responsible: e.target.value})}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B] font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Número estimado de colaboradores</label>
                <Input 
                  placeholder="Ex: 35" 
                  type="number"
                  value={form.count}
                  onChange={e => setForm({...form, count: e.target.value})}
                  className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B] font-medium"
                />
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={handleAddDepartment}
                className="w-full md:w-auto px-10 h-14 bg-[#F88A2B] hover:bg-[#e0751a] text-[#111] rounded-2xl transition-all shadow-lg shadow-[#F88A2B]/10 font-bold tracking-wide"
              >
                Adicionar departamento
              </Button>
            </div>
          </div>
        </section>

        {/* Departamentos Cadastrados */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#F88A2B]" />
              <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Departamentos cadastrados</h3>
            </div>
            <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{departments.length} Áreas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {departments.map((dept) => (
              <div key={dept.id} className="bg-white border border-black/[0.03] p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 text-black/20 hover:text-black/60">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-black/5">
                      <DropdownMenuItem className="text-xs font-bold gap-2">
                        <Edit2 className="w-3 h-3" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleRemove(dept.id)}
                        className="text-xs font-bold gap-2 text-red-500 focus:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" /> Remover
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F7F4F2] rounded-xl flex items-center justify-center text-[#F88A2B]">
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-[#0B0908]">{dept.name}</h4>
                      <p className="text-[10px] font-bold text-black/30 uppercase tracking-[0.1em]">{dept.code}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest flex items-center gap-1">
                        <Users className="w-2.5 h-2.5" /> Colaboradores
                      </p>
                      <p className="text-sm font-bold text-[#0B0908]">{dept.count}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-black/30 uppercase tracking-widest flex items-center gap-1">
                        <UserCircle2 className="w-2.5 h-2.5" /> Responsável
                      </p>
                      <p className="text-sm font-bold text-[#0B0908] truncate">{dept.responsible}</p>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Badge variant="secondary" className={`text-[9px] uppercase tracking-tighter h-5 px-2 font-bold ${
                      dept.count >= minVolume 
                        ? 'bg-green-100 text-green-700 border-none' 
                        : 'bg-blue-100 text-blue-700 border-none'
                    }`}>
                      {dept.count >= minVolume ? 'Elegível para recortes' : 'Protegido por volume mínimo'}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Regra de Anonimização */}
        <section className="bg-white border border-black/5 text-[#111] rounded-[2.5rem] p-8 md:p-12 text-[#111] relative overflow-hidden shadow-sm">
          {/* Amber Glow removed for white background consistency */}
          
          <div className="relative z-10 flex flex-col md:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6 text-center md:text-left">
              <div className="w-14 h-14 bg-black/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-black/5 mx-auto md:mx-0">
                <Lock className="w-7 h-7 text-[#F88A2B]" />
              </div>
              <h3 className="text-2xl font-playfair font-bold leading-tight">
                Grupos pequenos são protegidos automaticamente.
              </h3>
              <p className="text-[#999] text-sm font-light leading-relaxed">
                Departamentos com menos pessoas que o volume mínimo configurado não aparecem em recortes analíticos, alertas ou relatórios por área.
              </p>
            </div>

            <div className="shrink-0 space-y-4 bg-black/[0.03] p-8 rounded-3xl border border-black/5 text-center">
              <div className="space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAA]">Mínimo atual</p>
                <p className="text-4xl font-playfair font-bold text-[#F88A2B]">{minVolume}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#AAA]">Colaboradores / Área</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/enterprise/rh/privacidade')}
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B] hover:text-[#F88A2B] hover:bg-[#F88A2B]/10 rounded-full"
              >
                Alterar regra de privacidade
              </Button>
            </div>
          </div>
        </section>

        {/* Uso dos Departamentos */}
        <section className="space-y-6">
          <div className="text-center space-y-2">
             <h3 className="font-playfair text-xl font-bold text-[#0B0908]">Como os departamentos são usados</h3>
             <p className="text-xs text-black/40 font-medium">A base da sua estrutura Enterprise.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: <Plus className="w-4 h-4" />, title: "Convites", desc: "Associação no momento do convite." },
              { icon: <BarChart3 className="w-4 h-4" />, title: "Dashboards", desc: "Recortes por área com volume." },
              { icon: <ShieldCheck className="w-4 h-4" />, title: "Permissões", desc: "Líderes com acesso limitado." },
              { icon: <Lock className="w-4 h-4" />, title: "Relatórios", desc: "Dados sempre agregados." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-5 rounded-3xl border border-black/5 space-y-3 shadow-sm">
                <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-[#F88A2B] shadow-sm">
                  {item.icon}
                </div>
                <h5 className="font-bold text-[13px] text-[#0B0908]">{item.title}</h5>
                <p className="text-[10px] text-black/50 leading-relaxed font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTAs */}
        <section className="pt-8 space-y-4 max-w-lg mx-auto w-full">
          <Button 
            onClick={() => navigate('/enterprise/rh/equipe/convidar')}
            className="w-full h-16 bg-[#F88A2B] hover:bg-[#e0751a] text-[#111] rounded-2xl text-lg font-bold shadow-xl shadow-[#F88A2B]/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
          >
            Convidar colaboradores
          </Button>
          <Button 
            variant="ghost" 
            onClick={() => navigate('/enterprise/rh/configuracoes')}
            className="w-full h-14 text-[#0B0908]/50 hover:text-[#0B0908] hover:bg-black/5 rounded-2xl font-bold uppercase tracking-widest text-xs"
          >
            Voltar às configurações
          </Button>
        </section>

        {/* Footer */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-[#0B0908]/30 text-[10px] font-bold uppercase tracking-[0.2em] max-w-xs mx-auto leading-relaxed">
            Estrutura Corporativa Premium
          </p>
        </footer>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseDepartmentsScreen;
