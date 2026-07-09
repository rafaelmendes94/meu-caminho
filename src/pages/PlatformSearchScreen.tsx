import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Building2, User, GraduationCap, LifeBuoy, Search } from "lucide-react";

export default function PlatformSearchScreen() {
  const [sp] = useSearchParams();
  const navigate = useNavigate();
  const q = sp.get("q") || "";
  const [orgs, setOrgs] = useState<any[]>([]);
  const [owners, setOwners] = useState<any[]>([]);
  const [contents, setContents] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!q) return;
    (async () => {
      setLoading(true); setErr(null);
      try {
        const like = `%${q}%`;
        const [o, own, c, t] = await Promise.all([
          supabase.from("organizations").select("id,name,subscription_status").ilike("name", like).limit(50),
          supabase.from("profiles").select("id, full_name, display_name, organization_id, user_roles!inner(role)")
            .eq("user_roles.role", "owner").or(`full_name.ilike.${like},display_name.ilike.${like}`).limit(50),
          supabase.from("content_items").select("id,title,type").ilike("title", like).limit(50),
          supabase.from("support_tickets").select("id,title,status,priority").ilike("title", like).limit(50),
        ]);
        setOrgs(o.data || []); setOwners(own.data || []); setContents(c.data || []); setTickets(t.data || []);
      } catch (e: any) { setErr(e.message || "Erro"); }
      finally { setLoading(false); }
    })();
  }, [q]);

  const Section = ({ title, icon: Icon, items, render, empty }: any) => (
    <div className="bg-white border border-slate-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-slate-500" />
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
        <span className="text-[11px] text-slate-400">({items.length})</span>
      </div>
      {items.length === 0 ? <p className="text-xs text-slate-400">{empty}</p> : <ul className="divide-y divide-slate-100">{items.map(render)}</ul>}
    </div>
  );

  return (
    <PlatformAdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <Search className="w-6 h-6 text-slate-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Resultados para "{q}"</h1>
          <p className="text-xs text-slate-500">Busca global do Super Admin</p>
        </div>
      </div>
      {loading ? <p className="text-slate-500">Carregando…</p> :
       err ? <p className="text-red-500">{err}</p> :
       (<div className="grid gap-4">
         <Section title="Organizações" icon={Building2} items={orgs} empty="Nenhuma organização"
           render={(o: any) => (
             <li key={o.id}><button onClick={() => navigate(`/admin/organizations/${o.id}`)}
               className="w-full flex items-center justify-between py-2 hover:bg-slate-50">
               <span className="text-sm text-slate-800">{o.name}</span>
               <span className="text-[11px] text-slate-400">{o.subscription_status}</span>
             </button></li>)} />
         <Section title="Owners" icon={User} items={owners} empty="Nenhum owner"
           render={(p: any) => (
             <li key={p.id}><button onClick={() => p.organization_id && navigate(`/admin/organizations/${p.organization_id}`)}
               className="w-full text-left py-2 text-sm text-slate-800 hover:bg-slate-50">
               {p.display_name || p.full_name}
             </button></li>)} />
         <Section title="Conteúdos" icon={GraduationCap} items={contents} empty="Nenhum conteúdo"
           render={(c: any) => {
             const map: Record<string, string> = { book: "books", course: "courses", track: "tracks", podcast: "podcasts", video: "videos", audio: "audios", material: "materials" };
             const seg = map[c.type] || "library";
             return (<li key={c.id}><button onClick={() => navigate(`/admin/content/${seg}`)}
               className="w-full flex items-center justify-between py-2 hover:bg-slate-50 text-sm">
               <span className="text-slate-800">{c.title}</span>
               <span className="text-[11px] text-slate-400">{c.type}</span>
             </button></li>);
           }} />
         <Section title="Tickets" icon={LifeBuoy} items={tickets} empty="Nenhum ticket"
           render={(t: any) => (
             <li key={t.id}><button onClick={() => navigate("/admin/support")}
               className="w-full flex items-center justify-between py-2 hover:bg-slate-50 text-sm">
               <span className="text-slate-800">{t.title}</span>
               <span className="text-[11px] text-slate-400">{t.status} • {t.priority}</span>
             </button></li>)} />
       </div>)}
    </PlatformAdminLayout>
  );
}