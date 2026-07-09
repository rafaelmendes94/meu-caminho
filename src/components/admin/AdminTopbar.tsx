import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search, Bell, HelpCircle, LogOut, User as UserIcon, ShieldCheck, BookOpen,
  Building2, GraduationCap, FileText, LifeBuoy, Settings, Sparkles, X,
  AlertTriangle, CircleDot, ArrowUpRight, ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type Variant = "super" | "rh";

export type SearchResult = {
  id: string;
  type: "organization" | "content" | "ticket" | "setting";
  title: string;
  description?: string;
  route: string;
};

export type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "warning" | "critical";
  route?: string;
  created_at: string;
};

const iconByType = {
  organization: Building2,
  content: GraduationCap,
  ticket: LifeBuoy,
  setting: Settings,
} as const;

const READ_KEY = "admin:notifications:read";

function getReadIds(): Set<string> {
  try { return new Set(JSON.parse(localStorage.getItem(READ_KEY) || "[]")); }
  catch { return new Set(); }
}
function setReadIds(ids: Set<string>) {
  localStorage.setItem(READ_KEY, JSON.stringify([...ids]));
}

async function runSuperAdminSearch(q: string): Promise<SearchResult[]> {
  const like = `%${q}%`;
  const [orgs, contents, tickets] = await Promise.all([
    supabase.from("organizations").select("id,name,slug,subscription_status,responsible_name,responsible_email,cnpj,domain")
      .or(`name.ilike.${like},slug.ilike.${like},cnpj.ilike.${like},domain.ilike.${like},responsible_name.ilike.${like},responsible_email.ilike.${like}`)
      .limit(8),
    supabase.from("content_items").select("id,title,type,slug").ilike("title", like).limit(5),
    supabase.from("support_tickets").select("id,title,status").ilike("title", like).limit(5),
  ]);
  const out: SearchResult[] = [];
  (orgs.data || []).forEach((o: any) =>
    out.push({
      id: `org-${o.id}`, type: "organization", title: o.name,
      description: `Empresa • ${o.subscription_status || "—"}${o.responsible_name ? ` • ${o.responsible_name}` : ""}`,
      route: `/admin/organizations/${o.id}`,
    }));
  (contents.data || []).forEach((c: any) => {
    const map: Record<string, string> = { book: "books", course: "courses", track: "tracks", podcast: "podcasts", video: "videos", audio: "audios", material: "materials" };
    const seg = map[c.type] || "library";
    out.push({ id: `cnt-${c.id}`, type: "content", title: c.title, description: `Conteúdo • ${c.type}`, route: `/admin/content/${seg}` });
  });
  (tickets.data || []).forEach((t: any) =>
    out.push({ id: `tkt-${t.id}`, type: "ticket", title: t.title, description: `Ticket • ${t.status}`, route: `/admin/support` }));
  if (q.length >= 2 && "configurações".includes(q.toLowerCase())) {
    out.push({ id: "set-general", type: "setting", title: "Configurações da plataforma", description: "Ajustes gerais", route: "/admin/settings" });
  }
  return out;
}

async function loadSuperAdminNotifications(): Promise<AdminNotification[]> {
  const [tickets, pastDue, trials] = await Promise.all([
    supabase.from("support_tickets").select("id,title,status,created_at").eq("status", "open").order("created_at", { ascending: false }).limit(10),
    supabase.from("organizations").select("id,name,subscription_status,updated_at").eq("subscription_status", "past_due").order("updated_at", { ascending: false }).limit(10),
    supabase.from("organizations").select("id,name,subscription_status,created_at").eq("subscription_status", "trialing").order("created_at", { ascending: false }).limit(5),
  ]);
  const items: AdminNotification[] = [];
  (tickets.data || []).forEach((t: any) => items.push({
    id: `tkt-${t.id}`, type: "support", title: "Ticket aberto", message: t.title,
    severity: "warning", route: "/admin/support", created_at: t.created_at,
  }));
  (pastDue.data || []).forEach((o: any) => items.push({
    id: `pd-${o.id}`, type: "billing", title: "Pagamento pendente", message: `${o.name} está past_due`,
    severity: "critical", route: `/admin/organizations/${o.id}`, created_at: o.updated_at,
  }));
  (trials.data || []).forEach((o: any) => items.push({
    id: `tr-${o.id}`, type: "trial", title: "Novo trial", message: `${o.name} iniciou trial`,
    severity: "info", route: `/admin/organizations/${o.id}`, created_at: o.created_at,
  }));
  items.sort((a, b) => (b.created_at || "").localeCompare(a.created_at || ""));
  return items;
}

async function loadRhNotifications(orgId: string | null): Promise<AdminNotification[]> {
  if (!orgId) return [];
  const { data } = await supabase.from("alerts")
    .select("id,title,message,severity,created_at,action_url,status")
    .eq("organization_id", orgId)
    .order("created_at", { ascending: false })
    .limit(20);
  return (data || []).map((a: any) => ({
    id: a.id, type: "alert", title: a.title || "Alerta",
    message: a.message || "", severity: (a.severity as any) || "info",
    route: a.action_url || "/enterprise/rh/central-admin",
    created_at: a.created_at,
  }));
}

const HELP_ITEMS_SUPER = [
  { label: "Documentação da Plataforma", route: "/admin/docs", icon: BookOpen },
  { label: "Arquitetura", route: "/admin/docs?doc=architecture", icon: FileText },
  { label: "RLS e Segurança", route: "/admin/docs?doc=rls", icon: ShieldCheck },
  { label: "Edge Functions", route: "/admin/docs?doc=edge-functions", icon: Sparkles },
  { label: "CMS", route: "/admin/docs?doc=cms", icon: GraduationCap },
  { label: "Suporte técnico", route: "/admin/support", icon: LifeBuoy },
  { label: "Atalhos", route: "/admin/docs?doc=shortcuts", icon: FileText },
];
const HELP_ITEMS_RH = [
  { label: "Central de Ajuda", route: "/enterprise/rh/central-admin", icon: BookOpen },
  { label: "Suporte", route: "/enterprise/rh/central-admin", icon: LifeBuoy },
];

export function AdminTopbar({
  variant,
  onSignOut,
  title = "Platform Admin",
}: {
  variant: Variant;
  onSignOut: () => Promise<void> | void;
  title?: string;
}) {
  const { profile, user, organization } = useAuth();
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchErr, setSearchErr] = useState<string | null>(null);
  const [notifs, setNotifs] = useState<AdminNotification[]>([]);
  const [notifsLoading, setNotifsLoading] = useState(false);
  const [notifsErr, setNotifsErr] = useState<string | null>(null);
  const [readIds, setReadIdsState] = useState<Set<string>>(() => getReadIds());
  const searchRef = useRef<HTMLDivElement>(null);

  const initials = ((profile?.display_name || profile?.full_name || "SA")
    .split(" ").map((p) => p[0]).slice(0, 2).join("") || "SA").toUpperCase();

  const placeholder = variant === "super"
    ? "Pesquisar organizações, owners, conteúdos, tickets..."
    : "Pesquisar equipe, indicadores, planos, conteúdos...";

  // debounce
  useEffect(() => {
    if (variant !== "super") { setResults([]); return; }
    if (q.trim().length < 2) { setResults([]); setSearchErr(null); return; }
    setSearching(true); setSearchErr(null);
    const t = setTimeout(async () => {
      try { setResults(await runSuperAdminSearch(q.trim())); }
      catch (e: any) { setSearchErr(e?.message || "Erro na busca"); }
      finally { setSearching(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q, variant]);

  // close dropdown on outside click
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const loadNotifs = async () => {
    setNotifsLoading(true); setNotifsErr(null);
    try {
      const data = variant === "super"
        ? await loadSuperAdminNotifications()
        : await loadRhNotifications(organization?.id || null);
      setNotifs(data);
    } catch (e: any) { setNotifsErr(e?.message || "Erro ao carregar"); }
    finally { setNotifsLoading(false); }
  };

  const unreadCount = useMemo(
    () => notifs.filter((n) => !readIds.has(n.id)).length,
    [notifs, readIds]
  );

  const markRead = (id: string) => {
    const next = new Set(readIds); next.add(id); setReadIds(next); setReadIdsState(next);
  };
  const markAllRead = () => {
    const next = new Set(readIds); notifs.forEach((n) => next.add(n.id));
    setReadIds(next); setReadIdsState(next);
  };

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (variant === "super" && q.trim()) {
      navigate(`/admin/search?q=${encodeURIComponent(q.trim())}`);
      setSearchOpen(false);
    }
  };

  const helpItems = variant === "super" ? HELP_ITEMS_SUPER : HELP_ITEMS_RH;

  return (
    <header className="hidden lg:flex h-16 bg-white border-b border-slate-200 items-center gap-3 px-6 sticky top-0 z-30">
      {/* Search */}
      <div ref={searchRef} className="ml-auto w-full max-w-[420px] relative">
        <form onSubmit={submitSearch}>
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={q}
            onChange={(e) => { setQ(e.target.value); setSearchOpen(true); }}
            onFocus={() => setSearchOpen(true)}
            placeholder={placeholder}
            className="w-full h-10 pl-9 pr-9 rounded-lg bg-slate-100 border border-transparent focus:border-slate-300 focus:bg-white focus:outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
          {q && (
            <button type="button" onClick={() => { setQ(""); setResults([]); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-200">
              <X className="w-3.5 h-3.5 text-slate-500" />
            </button>
          )}
        </form>

        {searchOpen && variant === "super" && q.trim().length >= 2 && (
          <div className="absolute left-0 right-0 top-12 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-[420px] overflow-y-auto">
            {searching ? (
              <p className="p-4 text-xs text-slate-500">Buscando…</p>
            ) : searchErr ? (
              <p className="p-4 text-xs text-red-500">{searchErr}</p>
            ) : results.length === 0 ? (
              <p className="p-4 text-xs text-slate-500">Sem resultados encontrados</p>
            ) : (
              <>
                <ul className="py-1">
                  {results.map((r) => {
                    const Icon = iconByType[r.type];
                    return (
                      <li key={r.id}>
                        <button
                          onClick={() => { navigate(r.route); setSearchOpen(false); setQ(""); }}
                          className="w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-50 text-left"
                        >
                          <div className="w-8 h-8 rounded-lg bg-slate-100 grid place-items-center shrink-0">
                            <Icon className="w-4 h-4 text-slate-600" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-slate-800 truncate">{r.title}</p>
                            {r.description && <p className="text-[11px] text-slate-500 truncate">{r.description}</p>}
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </button>
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => submitSearch({ preventDefault: () => {} } as any)}
                  className="w-full px-3 py-2 border-t border-slate-100 text-xs font-semibold text-slate-600 hover:bg-slate-50 flex items-center justify-center gap-2"
                >
                  Ver todos os resultados <ArrowUpRight className="w-3 h-3" />
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Icon buttons */}
      <div className="flex items-center gap-1 text-slate-500">
        {/* Notifications */}
        <DropdownMenu onOpenChange={(o) => o && loadNotifs()}>
          <DropdownMenuTrigger asChild>
            <button className="relative w-10 h-10 grid place-items-center rounded-lg hover:bg-slate-100" title="Notificações">
              <Bell className="w-[18px] h-[18px]" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-red-500 text-white text-[9px] font-bold grid place-items-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[360px] p-0">
            <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100">
              <p className="text-sm font-bold text-slate-800">Notificações</p>
              <button onClick={markAllRead} className="text-[11px] text-slate-500 hover:text-slate-800">Marcar todas como lidas</button>
            </div>
            <div className="max-h-[360px] overflow-y-auto">
              {notifsLoading ? (
                <p className="p-4 text-xs text-slate-500">Carregando…</p>
              ) : notifsErr ? (
                <p className="p-4 text-xs text-red-500">{notifsErr}</p>
              ) : notifs.length === 0 ? (
                <p className="p-4 text-xs text-slate-500">Nenhuma notificação no momento</p>
              ) : notifs.map((n) => {
                const unread = !readIds.has(n.id);
                const Icon = n.severity === "critical" ? AlertTriangle : n.severity === "warning" ? CircleDot : Bell;
                const tone = n.severity === "critical" ? "text-red-500" : n.severity === "warning" ? "text-amber-500" : "text-blue-500";
                return (
                  <button
                    key={n.id}
                    onClick={() => { markRead(n.id); if (n.route) navigate(n.route); }}
                    className={`w-full text-left px-3 py-2 flex gap-3 border-b border-slate-50 hover:bg-slate-50 ${unread ? "bg-slate-50/60" : ""}`}
                  >
                    <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${tone}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-[13px] font-semibold text-slate-800 truncate">{n.title}</p>
                      <p className="text-[11px] text-slate-500 line-clamp-2">{n.message}</p>
                    </div>
                    {unread && <span className="w-2 h-2 rounded-full bg-[#F88A2B] shrink-0 mt-1.5" />}
                  </button>
                );
              })}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Help */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 grid place-items-center rounded-lg hover:bg-slate-100" title="Ajuda">
              <HelpCircle className="w-[18px] h-[18px]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel>Ajuda</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {helpItems.map((h) => (
              <DropdownMenuItem key={h.label} onClick={() => navigate(h.route)}>
                <h.icon className="w-4 h-4 mr-2" /> {h.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="h-8 w-px bg-slate-200 mx-1" />

      {/* Profile dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-3 pl-2 pr-1 py-1 rounded-lg hover:bg-slate-100">
            <div className="text-right hidden sm:block">
              <p className="text-[13px] font-semibold text-slate-800 leading-tight">
                {profile?.display_name || profile?.full_name || "Admin"}
              </p>
              <p className="text-[11px] text-slate-500 leading-tight">{title}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#F88A2B] to-[#e07020] text-white grid place-items-center text-xs font-bold">
              {initials}
            </div>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[240px]">
          <div className="px-2 py-2">
            <p className="text-sm font-semibold text-slate-800 truncate">{profile?.display_name || profile?.full_name || "Admin"}</p>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            <span className="mt-1 inline-block text-[10px] font-bold uppercase tracking-widest text-[#F88A2B]">{title}</span>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => navigate(variant === "super" ? "/admin/account" : "/enterprise/rh/central-admin")}>
            <UserIcon className="w-4 h-4 mr-2" /> Minha conta
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate(variant === "super" ? "/admin/security" : "/enterprise/rh/central-admin")}>
            <ShieldCheck className="w-4 h-4 mr-2" /> Segurança
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onSignOut()} className="text-red-600 focus:text-red-700">
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <button
        onClick={() => onSignOut()}
        className="w-10 h-10 grid place-items-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-[#F88A2B]"
        title="Sair"
      >
        <LogOut className="w-[18px] h-[18px]" />
      </button>
    </header>
  );
}

export default AdminTopbar;