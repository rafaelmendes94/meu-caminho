import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PlatformAdminLayout } from "@/components/layouts/PlatformAdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

/**
 * Fase 25 — CMS Enterprise Hub.
 * Painel único do Platform Admin para CRUD real de todos os
 * artefatos de conteúdo que ainda não tinham tela dedicada:
 * Competências, Emoções, Reflexões, Mensagens, Quizzes,
 * Certificados, Importações, Versões, Analytics.
 *
 * Reutiliza tabelas cms_* (RLS restrita a platform_admin) e
 * consome content_items / content_views para métricas.
 */

type Row = Record<string, any>;

type SimpleTable =
  | "cms_competencies"
  | "cms_emotions"
  | "cms_reflections"
  | "cms_messages"
  | "cms_quizzes"
  | "cms_certificates";

function useTable(table: SimpleTable, order = "created_at") {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const reload = async () => {
    setLoading(true);
    const { data, error } = await supabase.from(table).select("*").order(order, { ascending: false }).limit(500);
    if (error) toast.error(error.message);
    setRows(data ?? []);
    setLoading(false);
  };
  useEffect(() => { reload(); }, [table]);
  return { rows, loading, reload };
}

const StatusBadge = ({ status }: { status?: string }) => {
  const map: Record<string, string> = {
    draft: "bg-muted text-muted-foreground",
    review: "bg-amber-100 text-amber-800",
    published: "bg-emerald-100 text-emerald-800",
    archived: "bg-neutral-200 text-neutral-700",
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${map[status ?? "draft"] ?? map.draft}`}>{status ?? "draft"}</span>;
};

/* ============ Simple taxonomy CRUD (Competencies / Emotions) ============ */

function TaxonomyCRUD({ table, label }: { table: "cms_competencies" | "cms_emotions"; label: string }) {
  const { rows, loading, reload } = useTable(table, "name");
  const [form, setForm] = useState<Row>({ name: "", slug: "", description: "", color: "" });
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!form.name || !form.slug) return toast.error("Nome e slug são obrigatórios");
    setSaving(true);
    const { error } = form.id
      ? await supabase.from(table).update(form).eq("id", form.id)
      : await supabase.from(table).insert(form);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Salvo");
    setForm({ name: "", slug: "", description: "", color: "" });
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Remover?")) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <div className="grid md:grid-cols-[1fr,320px] gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">{label}</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum registro.</p>}
            {rows.map((r) => (
              <div key={r.id} className="flex items-center gap-3 p-2 rounded border">
                <span className="w-3 h-3 rounded-full" style={{ background: r.color || "#ccc" }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{r.slug} · {r.description}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setForm(r)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <h3 className="font-semibold">{form.id ? "Editar" : "Novo"}</h3>
        <div><Label>Nome</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Slug</Label><Input value={form.slug || ""} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></div>
        <div><Label>Descrição</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Cor</Label><Input type="color" value={form.color || "#888888"} onChange={(e) => setForm({ ...form, color: e.target.value })} /></div>
        <div className="flex gap-2">
          <Button onClick={save} disabled={saving}><Save className="w-4 h-4 mr-1" />Salvar</Button>
          {form.id && <Button variant="ghost" onClick={() => setForm({ name: "", slug: "", description: "", color: "" })}>Cancelar</Button>}
        </div>
      </Card>
    </div>
  );
}

/* ============ Reflections ============ */

function ReflectionsCRUD() {
  const { rows, loading, reload } = useTable("cms_reflections");
  const [form, setForm] = useState<Row>({ title: "", body: "", theme: "", status: "draft" });
  const save = async () => {
    if (!form.title || !form.body) return toast.error("Título e texto obrigatórios");
    const { error } = form.id
      ? await supabase.from("cms_reflections").update(form).eq("id", form.id)
      : await supabase.from("cms_reflections").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Salvo"); setForm({ title: "", body: "", theme: "", status: "draft" }); reload();
  };
  return (
    <div className="grid md:grid-cols-[1fr,360px] gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Reflexões</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="space-y-2">
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Sem reflexões.</p>}
            {rows.map((r) => (
              <div key={r.id} className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{r.title}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{r.body}</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => setForm(r)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!confirm("Remover?")) return;
                    await supabase.from("cms_reflections").delete().eq("id", r.id); reload();
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <h3 className="font-semibold">{form.id ? "Editar reflexão" : "Nova reflexão"}</h3>
        <div><Label>Título</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Texto</Label><Textarea rows={5} value={form.body || ""} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <div><Label>Tema</Label><Input value={form.theme || ""} onChange={(e) => setForm({ ...form, theme: e.target.value })} /></div>
        <div><Label>URL da imagem</Label><Input value={form.image_url || ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
        <div><Label>Status</Label>
          <select className="w-full h-9 border rounded px-2" value={form.status || "draft"} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Rascunho</option>
            <option value="review">Revisão</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <Button onClick={save}><Save className="w-4 h-4 mr-1" />Salvar</Button>
      </Card>
    </div>
  );
}

/* ============ Messages ============ */

const MESSAGE_CATEGORIES = ["energia", "lideranca", "ansiedade", "comunicacao", "produtividade"];

function MessagesCRUD() {
  const { rows, loading, reload } = useTable("cms_messages");
  const [form, setForm] = useState<Row>({ body: "", category: "energia", tone: "", status: "draft" });
  const save = async () => {
    if (!form.body) return toast.error("Texto obrigatório");
    const { error } = form.id
      ? await supabase.from("cms_messages").update(form).eq("id", form.id)
      : await supabase.from("cms_messages").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Salvo"); setForm({ body: "", category: "energia", tone: "", status: "draft" }); reload();
  };
  return (
    <div className="grid md:grid-cols-[1fr,340px] gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Mensagens motivacionais</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="p-3 rounded border flex items-start gap-3">
                <Badge variant="outline" className="capitalize">{r.category}</Badge>
                <div className="flex-1">
                  <p className="text-sm">{r.body}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <StatusBadge status={r.status} />
                    {r.tone && <span className="text-[11px] text-muted-foreground">tom: {r.tone}</span>}
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setForm(r)}>Editar</Button>
                <Button size="sm" variant="ghost" onClick={async () => {
                  if (!confirm("Remover?")) return;
                  await supabase.from("cms_messages").delete().eq("id", r.id); reload();
                }}><Trash2 className="w-4 h-4" /></Button>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma mensagem.</p>}
          </div>
        )}
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <h3 className="font-semibold">{form.id ? "Editar" : "Nova mensagem"}</h3>
        <div><Label>Texto</Label><Textarea rows={4} value={form.body || ""} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
        <div><Label>Categoria</Label>
          <select className="w-full h-9 border rounded px-2 capitalize" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
            {MESSAGE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div><Label>Tom</Label><Input placeholder="empático, direto…" value={form.tone || ""} onChange={(e) => setForm({ ...form, tone: e.target.value })} /></div>
        <div><Label>Status</Label>
          <select className="w-full h-9 border rounded px-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <Button onClick={save}><Save className="w-4 h-4 mr-1" />Salvar</Button>
      </Card>
    </div>
  );
}

/* ============ Quizzes ============ */

function QuizzesCRUD() {
  const { rows, loading, reload } = useTable("cms_quizzes");
  const [form, setForm] = useState<Row>({ title: "", description: "", passing_score: 70, status: "draft" });
  const save = async () => {
    if (!form.title) return toast.error("Título obrigatório");
    const { error } = form.id
      ? await supabase.from("cms_quizzes").update(form).eq("id", form.id)
      : await supabase.from("cms_quizzes").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Salvo"); setForm({ title: "", description: "", passing_score: 70, status: "draft" }); reload();
  };
  return (
    <div className="grid md:grid-cols-[1fr,340px] gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Quizzes</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{r.title}</p>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground">nota mínima: {r.passing_score}%</p>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => setForm(r)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!confirm("Remover?")) return;
                    await supabase.from("cms_quizzes").delete().eq("id", r.id); reload();
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum quiz. Crie um para adicionar questões via API.</p>}
          </div>
        )}
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <h3 className="font-semibold">{form.id ? "Editar quiz" : "Novo quiz"}</h3>
        <div><Label>Título</Label><Input value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
        <div><Label>Descrição</Label><Textarea value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div><Label>Nota mínima (%)</Label><Input type="number" value={form.passing_score} onChange={(e) => setForm({ ...form, passing_score: Number(e.target.value) })} /></div>
        <div><Label>Status</Label>
          <select className="w-full h-9 border rounded px-2" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="draft">Rascunho</option>
            <option value="review">Revisão</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <Button onClick={save}><Save className="w-4 h-4 mr-1" />Salvar</Button>
      </Card>
    </div>
  );
}

/* ============ Certificates ============ */

const DEFAULT_CERT_HTML = `<div style="text-align:center;font-family:serif;padding:80px">
  <h1>{{organization_name}}</h1>
  <h2>Certificado</h2>
  <p>Certificamos que <strong>{{user_name}}</strong> concluiu o curso <em>{{course_name}}</em> em {{date}}.</p>
  <p>Código: {{validation_code}}</p>
</div>`;

function CertificatesCRUD() {
  const { rows, loading, reload } = useTable("cms_certificates");
  const [form, setForm] = useState<Row>({ name: "", html_template: DEFAULT_CERT_HTML, status: "draft" });
  const save = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    const { error } = form.id
      ? await supabase.from("cms_certificates").update(form).eq("id", form.id)
      : await supabase.from("cms_certificates").insert(form);
    if (error) return toast.error(error.message);
    toast.success("Salvo"); setForm({ name: "", html_template: DEFAULT_CERT_HTML, status: "draft" }); reload();
  };
  return (
    <div className="grid md:grid-cols-[1fr,380px] gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Templates de certificado</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="p-3 rounded border">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{r.name}</p>
                  <StatusBadge status={r.status} />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button size="sm" variant="ghost" onClick={() => setForm(r)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={async () => {
                    if (!confirm("Remover?")) return;
                    await supabase.from("cms_certificates").delete().eq("id", r.id); reload();
                  }}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhum template.</p>}
          </div>
        )}
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <h3 className="font-semibold">{form.id ? "Editar" : "Novo template"}</h3>
        <div><Label>Nome</Label><Input value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div><Label>Logo plataforma (URL)</Label><Input value={form.platform_logo_url || ""} onChange={(e) => setForm({ ...form, platform_logo_url: e.target.value })} /></div>
        <div><Label>Logo empresa (URL)</Label><Input value={form.organization_logo_url || ""} onChange={(e) => setForm({ ...form, organization_logo_url: e.target.value })} /></div>
        <div><Label>HTML (usa {"{{"} placeholders {"}}"})</Label><Textarea rows={8} value={form.html_template || ""} onChange={(e) => setForm({ ...form, html_template: e.target.value })} /></div>
        <Button onClick={save}><Save className="w-4 h-4 mr-1" />Salvar</Button>
      </Card>
    </div>
  );
}

/* ============ Imports ============ */

function ImportsPanel() {
  const { rows, loading, reload } = useTable("cms_content_imports");
  const [kind, setKind] = useState("books");
  const [source, setSource] = useState("");
  const create = async () => {
    const { error } = await supabase.from("cms_content_imports").insert({ kind, source, status: "pending" });
    if (error) return toast.error(error.message);
    toast.success("Importação registrada. O processamento é feito por edge function futura.");
    setSource(""); reload();
  };
  return (
    <div className="grid md:grid-cols-[1fr,320px] gap-6">
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Histórico de importações</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="space-y-2">
            {rows.map((r) => (
              <div key={r.id} className="p-3 rounded border text-sm">
                <div className="flex items-center justify-between">
                  <span><Badge variant="outline">{r.kind}</Badge> {r.source}</span>
                  <StatusBadge status={r.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {r.succeeded}/{r.total} ok · {r.failed} falhas · {new Date(r.created_at).toLocaleString()}
                </p>
              </div>
            ))}
            {rows.length === 0 && <p className="text-sm text-muted-foreground">Nenhuma importação registrada.</p>}
          </div>
        )}
      </Card>
      <Card className="p-4 space-y-3 h-fit">
        <h3 className="font-semibold">Nova importação</h3>
        <div><Label>Tipo</Label>
          <select className="w-full h-9 border rounded px-2" value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="books">Livros (CSV)</option>
            <option value="courses">Cursos (ZIP)</option>
            <option value="videos">Vídeos</option>
            <option value="podcasts">Podcasts (RSS)</option>
            <option value="pdf">PDF em massa</option>
          </select>
        </div>
        <div><Label>Origem (URL ou identificador)</Label><Input value={source} onChange={(e) => setSource(e.target.value)} /></div>
        <Button onClick={create}><Plus className="w-4 h-4 mr-1" />Registrar</Button>
        <p className="text-xs text-muted-foreground">
          O processamento em massa (parse de CSV/RSS/ZIP e criação em <code>content_items</code>) roda em edge function
          dedicada — o registro fica em fila com status <code>pending</code>.
        </p>
      </Card>
    </div>
  );
}

/* ============ Versions ============ */

function VersionsPanel() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("cms_content_versions")
        .select("id,content_item_id,version,comment,created_at,author_id")
        .order("created_at", { ascending: false })
        .limit(200);
      setRows(data ?? []);
      setLoading(false);
    })();
  }, []);
  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3">Versões de conteúdo</h3>
      {loading ? <Loader2 className="animate-spin" /> : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nenhum snapshot ainda. Versões são geradas quando um conteúdo publicado é editado —
          insira em <code>cms_content_versions</code> a partir do editor do item.
        </p>
      ) : (
        <div className="space-y-2">
          {rows.map((r) => (
            <div key={r.id} className="p-2 rounded border text-sm flex items-center gap-3">
              <Badge variant="outline">v{r.version}</Badge>
              <span className="font-mono text-[11px] truncate flex-1">{r.content_item_id}</span>
              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/* ============ Analytics ============ */

function AnalyticsPanel() {
  const [stats, setStats] = useState<Row>({});
  const [top, setTop] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const [{ count: total }, { count: published }, { count: drafts }, { count: archived }] = await Promise.all([
        supabase.from("content_items").select("*", { count: "exact", head: true }),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("content_items").select("*", { count: "exact", head: true }).eq("status", "archived"),
      ]);
      const { data: views } = await supabase
        .from("content_views")
        .select("content_item_id")
        .limit(2000);
      const counts = new Map<string, number>();
      (views ?? []).forEach((v: any) => counts.set(v.content_item_id, (counts.get(v.content_item_id) ?? 0) + 1));
      const topIds = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
      const { data: items } = await supabase
        .from("content_items")
        .select("id,title,type")
        .in("id", topIds.map(([id]) => id));
      const map = new Map((items ?? []).map((i: any) => [i.id, i]));
      setTop(topIds.map(([id, c]) => ({ ...map.get(id), views: c })));
      setStats({ total, published, drafts, archived });
      setLoading(false);
    })();
  }, []);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { k: "Total", v: stats.total },
          { k: "Publicados", v: stats.published },
          { k: "Rascunhos", v: stats.drafts },
          { k: "Arquivados", v: stats.archived },
        ].map((s) => (
          <Card key={s.k} className="p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">{s.k}</p>
            <p className="text-2xl font-semibold">{loading ? "…" : (s.v ?? 0)}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <h3 className="font-semibold mb-3">Mais consumidos (últimos 2 mil views)</h3>
        {loading ? <Loader2 className="animate-spin" /> : top.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sem dados de visualização ainda.</p>
        ) : (
          <div className="space-y-2">
            {top.map((t) => (
              <div key={t.id} className="flex items-center gap-3 p-2 rounded border text-sm">
                <Badge variant="outline">{t.type ?? "—"}</Badge>
                <span className="flex-1 truncate">{t.title ?? t.id}</span>
                <span className="text-muted-foreground">{t.views} views</span>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

/* ============ Hub root ============ */

const SHORTCUTS: { to: string; label: string }[] = [
  { to: "/admin/content", label: "Dashboard" },
  { to: "/admin/content/books", label: "Livros" },
  { to: "/admin/content/authors", label: "Autores" },
  { to: "/admin/content/courses", label: "Cursos" },
  { to: "/admin/content/videos", label: "Vídeos" },
  { to: "/admin/content/podcasts", label: "Podcasts" },
  { to: "/admin/content/tracks", label: "Trilhas" },
  { to: "/admin/content/categories", label: "Categorias" },
  { to: "/admin/content/tags", label: "Tags" },
  { to: "/admin/content/library", label: "Biblioteca" },
  { to: "/admin/content/collections", label: "Coleções" },
  { to: "/admin/content/materials", label: "Materiais" },
];

export default function PlatformCMSHubScreen() {
  const [tab, setTab] = useState("competencies");
  const nav = useMemo(() => SHORTCUTS, []);
  return (
    <PlatformAdminLayout title="CMS Enterprise" subtitle="Content Hub — Fase 25">
      <div className="space-y-6">
        <Card className="p-4">
          <div className="flex flex-wrap gap-2">
            {nav.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="px-3 h-8 rounded-full border text-xs font-medium hover:bg-muted flex items-center"
              >
                {n.label}
              </Link>
            ))}
          </div>
        </Card>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex-wrap h-auto">
            <TabsTrigger value="competencies">Competências</TabsTrigger>
            <TabsTrigger value="emotions">Emoções</TabsTrigger>
            <TabsTrigger value="reflections">Reflexões</TabsTrigger>
            <TabsTrigger value="messages">Mensagens</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="certificates">Certificados</TabsTrigger>
            <TabsTrigger value="imports">Importações</TabsTrigger>
            <TabsTrigger value="versions">Versionamento</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
          <TabsContent value="competencies" className="mt-4"><TaxonomyCRUD table="cms_competencies" label="Competências" /></TabsContent>
          <TabsContent value="emotions" className="mt-4"><TaxonomyCRUD table="cms_emotions" label="Emoções" /></TabsContent>
          <TabsContent value="reflections" className="mt-4"><ReflectionsCRUD /></TabsContent>
          <TabsContent value="messages" className="mt-4"><MessagesCRUD /></TabsContent>
          <TabsContent value="quizzes" className="mt-4"><QuizzesCRUD /></TabsContent>
          <TabsContent value="certificates" className="mt-4"><CertificatesCRUD /></TabsContent>
          <TabsContent value="imports" className="mt-4"><ImportsPanel /></TabsContent>
          <TabsContent value="versions" className="mt-4"><VersionsPanel /></TabsContent>
          <TabsContent value="analytics" className="mt-4"><AnalyticsPanel /></TabsContent>
        </Tabs>
      </div>
    </PlatformAdminLayout>
  );
}