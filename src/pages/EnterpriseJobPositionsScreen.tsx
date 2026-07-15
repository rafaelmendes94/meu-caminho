import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Briefcase, Plus, Trash2, Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";

type Position = {
  id: string;
  name: string;
  code: string | null;
  description: string | null;
};

const EnterpriseJobPositionsScreen = () => {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [positions, setPositions] = useState<Position[]>([]);
  const [form, setForm] = useState({ name: "", code: "", description: "" });
  const [editing, setEditing] = useState<Position | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    if (!organization?.id) return;
    const { data, error } = await supabase
      .from("job_positions")
      .select("id,name,code,description")
      .eq("organization_id", organization.id)
      .order("name");
    if (error) { toast.error(error.message); return; }
    setPositions((data ?? []) as Position[]);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!organization?.id) return;
    if (!form.name.trim()) { toast.error("Informe o nome do cargo."); return; }
    setLoading(true);
    const { error } = await supabase.from("job_positions").insert({
      organization_id: organization.id,
      name: form.name.trim(),
      code: form.code.trim() || null,
      description: form.description.trim() || null,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setForm({ name: "", code: "", description: "" });
    toast.success("Cargo cadastrado.");
    load();
  };

  const handleUpdate = async () => {
    if (!editing) return;
    const { error } = await supabase.from("job_positions").update({
      name: editing.name,
      code: editing.code || null,
      description: editing.description || null,
    }).eq("id", editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cargo atualizado.");
    setEditing(null);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Remover este cargo?")) return;
    const { error } = await supabase.from("job_positions").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Cargo removido.");
    load();
  };

  return (
    <EnterpriseRHLayout title="Cargos">
      <div className="space-y-10 animate-fade-in py-2">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="rounded-full hover:bg-black/5">
            <ArrowLeft className="w-6 h-6 text-[#0B0908]" />
          </Button>
          <h1 className="text-xl font-playfair font-bold text-[#0B0908]">Cargos</h1>
        </div>

        <section className="bg-white border border-black/5 rounded-3xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Plus className="w-5 h-5 text-[#F88A2B]" />
            <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Cadastrar novo cargo</h3>
          </div>
          <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Nome do cargo</label>
              <Input
                placeholder="Ex: Analista de RH"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Código interno (opcional)</label>
              <Input
                placeholder="Ex: RH-01"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
                className="rounded-2xl border-black/5 bg-white h-14 focus-visible:ring-[#F88A2B]"
              />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-[#0B0908]/40 ml-1">Descrição (opcional)</label>
              <Textarea
                placeholder="Breve descrição do cargo"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="rounded-2xl border-black/5 bg-white focus-visible:ring-[#F88A2B]"
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                disabled={loading}
                className="px-10 h-14 bg-[#F88A2B] hover:bg-[#e0751a] text-[#111] rounded-2xl font-bold"
              >
                Adicionar cargo
              </Button>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-[#F88A2B]" />
              <h3 className="font-playfair text-lg font-bold text-[#0B0908]">Cargos cadastrados</h3>
            </div>
            <span className="text-[10px] font-bold text-black/30 uppercase tracking-widest">{positions.length} cargos</span>
          </div>
          {positions.length === 0 ? (
            <div className="bg-white p-8 rounded-3xl border border-black/5 text-center text-sm text-[#0B0908]/50">
              Nenhum cargo cadastrado. Adicione o primeiro no formulário acima.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {positions.map((p) => (
                <div key={p.id} className="bg-white border border-black/[0.05] p-6 rounded-3xl shadow-sm flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-[#F7F4F2] rounded-xl flex items-center justify-center text-[#F88A2B]">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#0B0908] truncate">{p.name}</h4>
                        {p.code && <p className="text-[10px] font-bold text-black/40 uppercase tracking-widest">{p.code}</p>}
                      </div>
                    </div>
                    {p.description && <p className="text-xs text-black/60 leading-relaxed">{p.description}</p>}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(p)} className="rounded-full h-8 w-8">
                      <Edit2 className="w-4 h-4 text-black/50" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)} className="rounded-full h-8 w-8">
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogContent className="rounded-3xl">
            <DialogHeader>
              <DialogTitle>Editar cargo</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="space-y-4">
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Nome" />
                <Input value={editing.code ?? ""} onChange={(e) => setEditing({ ...editing, code: e.target.value })} placeholder="Código" />
                <Textarea value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Descrição" />
              </div>
            )}
            <DialogFooter>
              <Button variant="ghost" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={handleUpdate} className="bg-[#F88A2B] hover:bg-[#e0751a] text-white">Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </EnterpriseRHLayout>
  );
};

export default EnterpriseJobPositionsScreen;