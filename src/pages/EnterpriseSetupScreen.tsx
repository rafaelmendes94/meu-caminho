import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const EnterpriseSetupScreen = () => {
  const navigate = useNavigate();
  const { user, profile, loading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [domain, setDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login", { replace: true });
    if (!loading && profile?.organization_id) navigate("/enterprise/rh/central-admin", { replace: true });
  }, [loading, user, profile, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Informe o nome da empresa");
    setSubmitting(true);
    const { data, error } = await supabase.functions.invoke("create-organization-admin", {
      body: {
        organization_name: name.trim(),
        slug: slug.trim() || slugify(name.trim()),
        cnpj: cnpj.trim() || null,
        domain: domain.trim() || null,
      },
    });
    setSubmitting(false);
    if (error || (data && (data as { error?: string }).error)) {
      toast.error((data as { error?: string })?.error ?? error?.message ?? "Falha ao criar organização");
      return;
    }
    toast.success("Organização criada com sucesso");
    await refresh();
    navigate("/enterprise/rh/central-admin", { replace: true });
  };

  return (
    <main className="min-h-screen bg-[#F7F4F2] font-montserrat flex items-center justify-center px-6 py-12">
      <form onSubmit={onSubmit} className="w-full max-w-lg bg-white border border-[#E5E0DA] rounded-3xl p-8 shadow-sm space-y-6">
        <header className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#F88A2B]">Setup Enterprise</p>
          <h1 className="text-2xl font-black text-[#0B0908]">Crie sua organização</h1>
          <p className="text-sm text-[#666]">Ao criar, você se torna owner da empresa.</p>
        </header>
        <div className="space-y-4">
          <Field label="Nome da empresa *" value={name} onChange={(v) => { setName(v); if (!slug) setSlug(slugify(v)); }} placeholder="Ex: Acme Ltda" />
          <Field label="Slug (identificador único)" value={slug} onChange={setSlug} placeholder="acme" />
          <Field label="CNPJ (opcional)" value={cnpj} onChange={setCnpj} placeholder="00.000.000/0000-00" />
          <Field label="Domínio corporativo (opcional)" value={domain} onChange={setDomain} placeholder="acme.com.br" />
        </div>
        <button type="submit" disabled={submitting} className="w-full h-14 rounded-2xl bg-[#F88A2B] text-white font-bold disabled:opacity-60">
          {submitting ? "Criando..." : "Criar organização"}
        </button>
      </form>
    </main>
  );
};

const Field = ({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) => (
  <label className="block space-y-1.5">
    <span className="text-[11px] font-bold uppercase tracking-widest text-[#0B0908]/50">{label}</span>
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full h-12 px-4 rounded-xl border border-[#E5E0DA] bg-white text-[15px] focus:outline-none focus:border-[#F88A2B]" />
  </label>
);

export default EnterpriseSetupScreen;