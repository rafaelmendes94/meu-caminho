import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { rhNavGroups } from "./rhNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Users, AlertTriangle, FileText, Building2 } from "lucide-react";

type Hit = { id: string; label: string; hint?: string; to: string; icon: any };

export function RHCommandPalette({
  open, onOpenChange,
}: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const navigate = useNavigate();
  const { organization } = useAuth();
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => { if (!open) { setQ(""); setHits([]); } }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2 || !organization?.id) { setHits([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      const like = `%${term}%`;
      try {
        const [emps, alerts, plans, depts] = await Promise.all([
          supabase.from("employee_profiles")
            .select("id,full_name,email,department_id")
            .eq("organization_id", organization.id)
            .or(`full_name.ilike.${like},email.ilike.${like}`).limit(5),
          supabase.from("alerts")
            .select("id,title,severity")
            .eq("organization_id", organization.id)
            .ilike("title", like).limit(5),
          supabase.from("action_plans")
            .select("id,title,status")
            .eq("organization_id", organization.id)
            .ilike("title", like).limit(5),
          supabase.from("departments")
            .select("id,name")
            .eq("organization_id", organization.id)
            .ilike("name", like).limit(5),
        ]);
        if (cancelled) return;
        const out: Hit[] = [];
        (emps.data || []).forEach((e: any) => out.push({
          id: `e-${e.id}`, label: e.full_name || e.email, hint: "Colaborador",
          to: "/enterprise/rh/equipe", icon: Users,
        }));
        (alerts.data || []).forEach((a: any) => out.push({
          id: `a-${a.id}`, label: a.title, hint: `Alerta • ${a.severity || "info"}`,
          to: "/enterprise/rh/alertas", icon: AlertTriangle,
        }));
        (plans.data || []).forEach((p: any) => out.push({
          id: `p-${p.id}`, label: p.title, hint: `Plano • ${p.status || "—"}`,
          to: "/enterprise/rh/plano-acao", icon: FileText,
        }));
        (depts.data || []).forEach((d: any) => out.push({
          id: `d-${d.id}`, label: d.name, hint: "Departamento",
          to: "/enterprise/rh/departamentos", icon: Building2,
        }));
        setHits(out);
      } catch { /* ignore */ }
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q, organization?.id]);

  const go = (to: string) => { onOpenChange(false); navigate(to); };

  const groups = useMemo(() => rhNavGroups, []);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar telas, colaboradores, planos, alertas…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>

        {hits.length > 0 && (
          <>
            <CommandGroup heading="Resultados">
              {hits.map((h) => (
                <CommandItem key={h.id} value={h.label} onSelect={() => go(h.to)}>
                  <h.icon className="w-4 h-4 mr-2" />
                  <span className="truncate">{h.label}</span>
                  {h.hint && <span className="ml-auto text-[10px] text-muted-foreground">{h.hint}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {groups.map((g) => (
          <CommandGroup key={g.key} heading={g.label}>
            {g.items.map((i) => (
              <CommandItem key={i.to} value={`${i.label} ${i.keywords || ""} ${g.label}`} onSelect={() => go(i.to)}>
                <i.icon className="w-4 h-4 mr-2" /> {i.label}
                <span className="ml-auto text-[10px] text-muted-foreground">{g.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export default RHCommandPalette;