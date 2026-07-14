import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog, CommandEmpty, CommandGroup, CommandInput,
  CommandItem, CommandList, CommandSeparator,
} from "@/components/ui/command";
import { adminNavGroups, flattenAdminNav } from "./adminNav";
import { getFavorites, getRecents, pushRecent, useAdminPrefsVersion } from "@/lib/adminPrefs";
import { supabase } from "@/integrations/supabase/client";
import { Building2, BookOpen, Star, Clock } from "lucide-react";

type RemoteHit = {
  id: string;
  label: string;
  hint?: string;
  to: string;
  kind: "org" | "content";
};

export function CommandPalette({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [remote, setRemote] = useState<RemoteHit[]>([]);
  useAdminPrefsVersion();

  const items = useMemo(() => flattenAdminNav(), []);
  const favorites = getFavorites();
  const recents = getRecents();

  useEffect(() => {
    if (!open) { setQ(""); setRemote([]); }
  }, [open]);

  useEffect(() => {
    const term = q.trim();
    if (term.length < 2) { setRemote([]); return; }
    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const like = `%${term}%`;
        const [orgs, content] = await Promise.all([
          supabase.from("organizations").select("id,name,slug").or(`name.ilike.${like},slug.ilike.${like}`).limit(6),
          supabase.from("content_items").select("id,title,type").ilike("title", like).limit(6),
        ]);
        if (cancelled) return;
        const hits: RemoteHit[] = [];
        (orgs.data || []).forEach((o: any) => hits.push({
          id: `org-${o.id}`, kind: "org", label: o.name,
          hint: o.slug || "empresa", to: `/admin/organizations/${o.id}`,
        }));
        (content.data || []).forEach((c: any) => {
          const map: Record<string,string> = { book: "books", course: "courses", track: "tracks", podcast: "podcasts", video: "videos", audio: "audios", material: "materials" };
          const seg = map[c.type] || "library";
          hits.push({ id: `c-${c.id}`, kind: "content", label: c.title, hint: c.type, to: `/admin/content/${seg}` });
        });
        setRemote(hits);
      } catch { /* ignore */ }
    }, 220);
    return () => { cancelled = true; clearTimeout(t); };
  }, [q]);

  const go = (to: string, label: string) => {
    pushRecent({ to, label });
    onOpenChange(false);
    navigate(to);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Pesquisar telas, empresas, conteúdos…" value={q} onValueChange={setQ} />
      <CommandList>
        <CommandEmpty>Nenhum resultado.</CommandEmpty>

        {!q && favorites.length > 0 && (
          <>
            <CommandGroup heading="Favoritos">
              {favorites.map((f) => (
                <CommandItem key={`fav-${f.to}`} onSelect={() => go(f.to, f.label)}>
                  <Star className="w-4 h-4 mr-2" /> {f.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {!q && recents.length > 0 && (
          <>
            <CommandGroup heading="Recentes">
              {recents.map((r) => (
                <CommandItem key={`r-${r.to}`} onSelect={() => go(r.to, r.label)}>
                  <Clock className="w-4 h-4 mr-2" /> {r.label}
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {adminNavGroups.map((g) => (
          <CommandGroup key={g.key} heading={g.label}>
            {g.items.map((i) => (
              <CommandItem
                key={i.to}
                value={`${i.label} ${i.keywords || ""} ${g.label}`}
                onSelect={() => go(i.to, i.label)}
              >
                <i.icon className="w-4 h-4 mr-2" /> {i.label}
                <span className="ml-auto text-[10px] text-muted-foreground">{g.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {remote.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Resultados">
              {remote.map((r) => (
                <CommandItem key={r.id} value={r.label} onSelect={() => go(r.to, r.label)}>
                  {r.kind === "org" ? <Building2 className="w-4 h-4 mr-2" /> : <BookOpen className="w-4 h-4 mr-2" />}
                  <span className="truncate">{r.label}</span>
                  {r.hint && <span className="ml-auto text-[10px] text-muted-foreground">{r.hint}</span>}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        <CommandGroup heading="Ações">
          <CommandItem value="pesquisa avançada global" onSelect={() => go(q ? `/admin/search?q=${encodeURIComponent(q)}` : "/admin/search", "Pesquisa avançada")}>
            Abrir pesquisa avançada{q ? ` por "${q}"` : ""}
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}

export default CommandPalette;