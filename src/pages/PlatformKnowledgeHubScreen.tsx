import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload, RefreshCw, Trash2, Eye, Search, FileText, Layers, Tags, History, Activity, LayoutDashboard, MessageSquare } from "lucide-react";

type Doc = {
  id: string;
  organization_id: string | null;
  collection_id: string | null;
  category_id: string | null;
  title: string;
  description: string | null;
  author: string | null;
  doc_type: string;
  status: string;
  version: number;
  storage_path: string | null;
  page_count: number;
  chunk_count: number;
  quality_score: number;
  is_published: boolean;
  ai_summary: string | null;
  keywords: string[] | null;
  tags: string[] | null;
  created_at: string;
  updated_at: string;
  error_message: string | null;
};

type Collection = { id: string; name: string; slug: string; description: string | null; organization_id: string | null; is_active: boolean };
type Category = { id: string; name: string; slug: string; parent_id: string | null; organization_id: string | null };
type Org = { id: string; name: string };

const DOC_TYPES = ["pdf", "docx", "pptx", "txt", "md", "html", "url"];

export default function PlatformKnowledgeHubScreen() {
  const [tab, setTab] = useState("library");
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({ q: "", collection: "all", status: "all", org: "global" });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [dRes, cRes, catRes, oRes] = await Promise.all([
      supabase.from("knowledge_documents").select("*").order("updated_at", { ascending: false }).limit(500),
      supabase.from("knowledge_collections").select("*").order("name"),
      supabase.from("knowledge_categories").select("*").order("name"),
      supabase.from("organizations").select("id,name").order("name").limit(200),
    ]);
    if (dRes.error) toast.error("Erro ao carregar documentos");
    else setDocs((dRes.data ?? []) as Doc[]);
    setCollections((cRes.data ?? []) as Collection[]);
    setCategories((catRes.data ?? []) as Category[]);
    setOrgs((oRes.data ?? []) as Org[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const filteredDocs = useMemo(() => {
    return docs.filter((d) => {
      if (filter.org === "global" && d.organization_id) return false;
      if (filter.org !== "global" && filter.org !== "all" && d.organization_id !== filter.org) return false;
      if (filter.collection !== "all" && d.collection_id !== filter.collection) return false;
      if (filter.status !== "all" && d.status !== filter.status) return false;
      if (filter.q && !`${d.title} ${d.description ?? ""} ${(d.keywords ?? []).join(" ")}`.toLowerCase().includes(filter.q.toLowerCase())) return false;
      return true;
    });
  }, [docs, filter]);

  return (
    <PlatformAdminLayout>
      <header className="mb-6">
        <p className="text-[10px] uppercase tracking-[0.25em] text-white/40">Knowledge</p>
        <h1 className="text-3xl font-black text-white mt-1">Knowledge Hub™</h1>
        <p className="text-sm text-white/60 mt-2">Base de conhecimento corporativa — documentos, embeddings e RAG para todas as IA.</p>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 flex-wrap h-auto">
          <TabsTrigger value="library"><FileText className="w-3.5 h-3.5 mr-1.5" />Biblioteca</TabsTrigger>
          <TabsTrigger value="upload"><Upload className="w-3.5 h-3.5 mr-1.5" />Upload</TabsTrigger>
          <TabsTrigger value="collections"><Layers className="w-3.5 h-3.5 mr-1.5" />Coleções</TabsTrigger>
          <TabsTrigger value="categories"><Tags className="w-3.5 h-3.5 mr-1.5" />Categorias</TabsTrigger>
          <TabsTrigger value="search"><Search className="w-3.5 h-3.5 mr-1.5" />Busca / RAG</TabsTrigger>
          <TabsTrigger value="logs"><Activity className="w-3.5 h-3.5 mr-1.5" />Logs</TabsTrigger>
          <TabsTrigger value="dashboard"><LayoutDashboard className="w-3.5 h-3.5 mr-1.5" />Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="mt-4">
          <LibraryTab
            loading={loading}
            docs={filteredDocs}
            allDocs={docs}
            collections={collections}
            categories={categories}
            orgs={orgs}
            filter={filter}
            setFilter={setFilter}
            reload={loadAll}
          />
        </TabsContent>

        <TabsContent value="upload" className="mt-4">
          <UploadTab collections={collections} categories={categories} orgs={orgs} onDone={loadAll} />
        </TabsContent>

        <TabsContent value="collections" className="mt-4">
          <CollectionsTab collections={collections} orgs={orgs} reload={loadAll} />
        </TabsContent>

        <TabsContent value="categories" className="mt-4">
          <CategoriesTab categories={categories} orgs={orgs} reload={loadAll} />
        </TabsContent>

        <TabsContent value="search" className="mt-4">
          <SearchTab orgs={orgs} />
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <LogsTab />
        </TabsContent>

        <TabsContent value="dashboard" className="mt-4">
          <DashboardTab docs={docs} />
        </TabsContent>
      </Tabs>
    </PlatformAdminLayout>
  );
}

/* ============================================================ LIBRARY */
function LibraryTab({ loading, docs, allDocs, collections, categories, orgs, filter, setFilter, reload }: {
  loading: boolean; docs: Doc[]; allDocs: Doc[]; collections: Collection[]; categories: Category[]; orgs: Org[];
  filter: { q: string; collection: string; status: string; org: string };
  setFilter: (f: any) => void; reload: () => void;
}) {
  const [selected, setSelected] = useState<Doc | null>(null);

  const remove = async (d: Doc) => {
    if (!confirm(`Excluir "${d.title}"? Esta ação remove chunks e embeddings.`)) return;
    const { error } = await supabase.from("knowledge_documents").delete().eq("id", d.id);
    if (error) return toast.error(error.message);
    if (d.storage_path) await supabase.storage.from("knowledge-hub").remove([d.storage_path]);
    toast.success("Documento removido");
    reload();
  };

  const reprocess = async (d: Doc) => {
    const { error } = await supabase.functions.invoke("knowledge-ingest", {
      body: { document_id: d.id, title: d.title, storage_path: d.storage_path, doc_type: d.doc_type },
    });
    if (error) return toast.error(error.message);
    toast.success("Reprocessamento iniciado");
    setTimeout(reload, 1500);
  };

  const togglePublish = async (d: Doc) => {
    const { error } = await supabase.from("knowledge_documents").update({ is_published: !d.is_published }).eq("id", d.id);
    if (error) return toast.error(error.message);
    reload();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 grid gap-3 md:grid-cols-5">
          <Input placeholder="Buscar por título, descrição, keywords…" value={filter.q} onChange={(e) => setFilter({ ...filter, q: e.target.value })} className="bg-white/5 border-white/10 text-white" />
          <Select value={filter.org} onValueChange={(v) => setFilter({ ...filter, org: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas orgs</SelectItem><SelectItem value="global">Global</SelectItem>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filter.collection} onValueChange={(v) => setFilter({ ...filter, collection: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Coleção" /></SelectTrigger>
            <SelectContent><SelectItem value="all">Todas coleções</SelectItem>{collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={filter.status} onValueChange={(v) => setFilter({ ...filter, status: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="indexed">Indexado</SelectItem>
              <SelectItem value="error">Erro</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={reload} className="bg-white/5 border-white/10 text-white"><RefreshCw className="w-3.5 h-3.5 mr-1.5" />Atualizar</Button>
        </CardContent>
      </Card>

      <div className="text-xs text-white/50">{docs.length} de {allDocs.length} documentos</div>

      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Título</th>
              <th className="text-left px-3 py-2">Tipo</th>
              <th className="text-left px-3 py-2">Status</th>
              <th className="text-left px-3 py-2">Chunks</th>
              <th className="text-left px-3 py-2">Qual.</th>
              <th className="text-left px-3 py-2">Publicado</th>
              <th className="text-left px-3 py-2">Atualizado</th>
              <th className="text-right px-3 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={8} className="p-6 text-center text-white/50"><Loader2 className="w-4 h-4 inline animate-spin mr-2" />Carregando…</td></tr>}
            {!loading && docs.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-white/40">Nenhum documento.</td></tr>}
            {docs.map((d) => (
              <tr key={d.id} className="border-t border-white/5 hover:bg-white/[0.03]">
                <td className="px-3 py-2 text-white">
                  <div className="font-medium">{d.title}</div>
                  {d.description && <div className="text-xs text-white/40 line-clamp-1">{d.description}</div>}
                </td>
                <td className="px-3 py-2"><Badge variant="outline" className="text-[10px] uppercase">{d.doc_type}</Badge></td>
                <td className="px-3 py-2"><StatusBadge status={d.status} /></td>
                <td className="px-3 py-2 text-white/70">{d.chunk_count}</td>
                <td className="px-3 py-2 text-white/70">{Number(d.quality_score ?? 0).toFixed(2)}</td>
                <td className="px-3 py-2">
                  <button onClick={() => togglePublish(d)} className={`text-xs px-2 py-0.5 rounded ${d.is_published ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>{d.is_published ? "Sim" : "Não"}</button>
                </td>
                <td className="px-3 py-2 text-white/50 text-xs">{new Date(d.updated_at).toLocaleString("pt-BR")}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <Button size="sm" variant="ghost" onClick={() => setSelected(d)}><Eye className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => reprocess(d)}><RefreshCw className="w-3.5 h-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(d)} className="text-red-400 hover:text-red-300"><Trash2 className="w-3.5 h-3.5" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && <DocDetail doc={selected} onClose={() => setSelected(null)} collections={collections} categories={categories} reload={() => { reload(); setSelected(null); }} />}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-white/10 text-white/60",
    processing: "bg-amber-500/20 text-amber-300",
    indexed: "bg-emerald-500/20 text-emerald-300",
    error: "bg-red-500/20 text-red-300",
  };
  return <span className={`text-[10px] uppercase px-2 py-0.5 rounded ${map[status] ?? "bg-white/10 text-white/60"}`}>{status}</span>;
}

/* ============================================================ DOC DETAIL */
function DocDetail({ doc, onClose, collections, categories, reload }: { doc: Doc; onClose: () => void; collections: Collection[]; categories: Category[]; reload: () => void }) {
  const [form, setForm] = useState({
    title: doc.title,
    description: doc.description ?? "",
    author: doc.author ?? "",
    collection_id: doc.collection_id ?? "",
    category_id: doc.category_id ?? "",
    tags: (doc.tags ?? []).join(", "),
  });
  const [versions, setVersions] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("knowledge_versions").select("*").eq("document_id", doc.id).order("created_at", { ascending: false }).limit(20)
      .then(({ data }) => setVersions(data ?? []));
  }, [doc.id]);

  const save = async () => {
    const { error } = await supabase.from("knowledge_documents").update({
      title: form.title, description: form.description || null, author: form.author || null,
      collection_id: form.collection_id || null, category_id: form.category_id || null,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    }).eq("id", doc.id);
    if (error) return toast.error(error.message);
    toast.success("Documento atualizado");
    reload();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-neutral-950 border border-white/10 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-white/10 flex items-start justify-between">
          <div>
            <div className="text-xs text-white/40 uppercase tracking-widest">Documento</div>
            <h2 className="text-xl font-bold text-white mt-1">{doc.title}</h2>
          </div>
          <Button size="sm" variant="ghost" onClick={onClose} className="text-white/60">Fechar</Button>
        </div>
        <div className="p-5 space-y-4">
          {doc.ai_summary && (
            <div className="bg-white/5 border border-white/10 rounded p-3">
              <div className="text-[10px] uppercase text-white/40 mb-1">Resumo IA</div>
              <p className="text-sm text-white/80">{doc.ai_summary}</p>
            </div>
          )}
          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Título"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
            <Field label="Autor"><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
            <Field label="Coleção">
              <Select value={form.collection_id || "none"} onValueChange={(v) => setForm({ ...form, collection_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">—</SelectItem>{collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Categoria">
              <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
                <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
                <SelectContent><SelectItem value="none">—</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
              </Select>
            </Field>
            <Field label="Descrição" full><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 text-white" rows={3} /></Field>
            <Field label="Tags (vírgula)" full><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          </div>
          <div className="grid grid-cols-4 gap-3 text-xs text-white/60">
            <Stat label="Chunks" value={doc.chunk_count} />
            <Stat label="Páginas" value={doc.page_count} />
            <Stat label="Qualidade" value={Number(doc.quality_score ?? 0).toFixed(2)} />
            <Stat label="Versão" value={doc.version} />
          </div>
          {doc.error_message && <div className="text-xs text-red-300 bg-red-500/10 border border-red-500/20 p-2 rounded">{doc.error_message}</div>}
          <div>
            <div className="text-[10px] uppercase text-white/40 mb-2 flex items-center gap-2"><History className="w-3 h-3" />Histórico de versões</div>
            {versions.length === 0 && <div className="text-xs text-white/40">Sem versões registradas.</div>}
            <ul className="space-y-1">
              {versions.map((v) => (
                <li key={v.id} className="text-xs text-white/60 flex justify-between border-b border-white/5 py-1">
                  <span>v{v.version}</span><span>{new Date(v.created_at).toLocaleString("pt-BR")}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="p-5 border-t border-white/10 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} className="bg-white/5 border-white/10 text-white">Cancelar</Button>
          <Button onClick={save} className="bg-emerald-600 hover:bg-emerald-500 text-white">Salvar</Button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return <div className={full ? "md:col-span-2" : ""}><Label className="text-xs text-white/60 mb-1 block">{label}</Label>{children}</div>;
}
function Stat({ label, value }: { label: string; value: any }) {
  return <div className="bg-white/5 border border-white/10 rounded p-2 text-center"><div className="text-[10px] uppercase text-white/40">{label}</div><div className="text-white font-semibold">{value}</div></div>;
}

/* ============================================================ UPLOAD */
function UploadTab({ collections, categories, orgs, onDone }: { collections: Collection[]; categories: Category[]; orgs: Org[]; onDone: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    author: "",
    organization_id: "",
    collection_id: "",
    category_id: "",
    doc_type: "txt",
    tags: "",
    raw_text: "",
    source_url: "",
    publish: true,
  });

  const submit = async () => {
    if (!form.title) return toast.error("Informe um título");
    setBusy(true);
    try {
      let storage_path: string | null = null;
      const file = fileRef.current?.files?.[0];
      if (file) {
        const ext = file.name.split(".").pop() ?? "bin";
        const path = `${form.organization_id || "global"}/${crypto.randomUUID()}.${ext}`;
        const up = await supabase.storage.from("knowledge-hub").upload(path, file, { upsert: false });
        if (up.error) throw up.error;
        storage_path = path;
      }
      const { data, error } = await supabase.functions.invoke("knowledge-ingest", {
        body: {
          title: form.title,
          description: form.description || null,
          author: form.author || null,
          organization_id: form.organization_id || null,
          collection_id: form.collection_id || null,
          category_id: form.category_id || null,
          doc_type: form.doc_type,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          storage_path,
          raw_text: form.raw_text || null,
          source_url: form.source_url || null,
          publish: form.publish,
        },
      });
      if (error) throw error;
      toast.success(`Documento indexado (${(data as any)?.chunks ?? 0} chunks)`);
      setForm({ ...form, title: "", description: "", raw_text: "", source_url: "" });
      if (fileRef.current) fileRef.current.value = "";
      onDone();
    } catch (e: any) {
      toast.error(e?.message ?? "Falha no upload");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card className="bg-white/5 border-white/10">
      <CardHeader><CardTitle className="text-white text-base">Novo documento</CardTitle></CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <Field label="Título"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
        <Field label="Autor"><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
        <Field label="Organização">
          <Select value={form.organization_id || "global"} onValueChange={(v) => setForm({ ...form, organization_id: v === "global" ? "" : v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="global">Global</SelectItem>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Coleção">
          <Select value={form.collection_id || "none"} onValueChange={(v) => setForm({ ...form, collection_id: v === "none" ? "" : v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="none">—</SelectItem>{collections.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Categoria">
          <Select value={form.category_id || "none"} onValueChange={(v) => setForm({ ...form, category_id: v === "none" ? "" : v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="none">—</SelectItem>{categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Tipo">
          <Select value={form.doc_type} onValueChange={(v) => setForm({ ...form, doc_type: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent>{DOC_TYPES.map((t) => <SelectItem key={t} value={t}>{t.toUpperCase()}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Descrição" full><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="bg-white/5 border-white/10 text-white" rows={2} /></Field>
        <Field label="Tags (vírgula)" full><Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
        <Field label="Arquivo (opcional)" full>
          <input ref={fileRef} type="file" className="text-sm text-white/70 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border file:border-white/10 file:bg-white/5 file:text-white" />
          <p className="text-[10px] text-white/40 mt-1">PDF/DOCX/PPTX: apenas texto plano é extraído nesta fase. Prefira TXT/MD ou cole o texto abaixo.</p>
        </Field>
        <Field label="Texto bruto (opcional)" full><Textarea value={form.raw_text} onChange={(e) => setForm({ ...form, raw_text: e.target.value })} rows={6} className="bg-white/5 border-white/10 text-white font-mono text-xs" /></Field>
        <Field label="URL (opcional)"><Input value={form.source_url} onChange={(e) => setForm({ ...form, source_url: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
        <Field label="Publicar após indexar">
          <Select value={form.publish ? "yes" : "no"} onValueChange={(v) => setForm({ ...form, publish: v === "yes" })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="yes">Sim</SelectItem><SelectItem value="no">Não (rascunho)</SelectItem></SelectContent>
          </Select>
        </Field>
        <div className="md:col-span-2 flex justify-end">
          <Button onClick={submit} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white">
            {busy ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Indexando…</> : <><Upload className="w-4 h-4 mr-2" />Ingerir & Indexar</>}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

/* ============================================================ COLLECTIONS */
function CollectionsTab({ collections, orgs, reload }: { collections: Collection[]; orgs: Org[]; reload: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", description: "", organization_id: "" });
  const save = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("knowledge_collections").insert({
      name: form.name, slug, description: form.description || null, organization_id: form.organization_id || null, is_active: true,
    });
    if (error) return toast.error(error.message);
    toast.success("Coleção criada");
    setForm({ name: "", slug: "", description: "", organization_id: "" });
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir coleção?")) return;
    const { error } = await supabase.from("knowledge_collections").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60 text-xs uppercase"><tr><th className="text-left px-3 py-2">Nome</th><th className="text-left px-3 py-2">Slug</th><th className="text-left px-3 py-2">Escopo</th><th className="text-right px-3 py-2">Ações</th></tr></thead>
          <tbody>
            {collections.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-3 py-2 text-white">{c.name}<div className="text-xs text-white/40">{c.description}</div></td>
                <td className="px-3 py-2 text-white/60 text-xs">{c.slug}</td>
                <td className="px-3 py-2 text-white/60 text-xs">{c.organization_id ? orgs.find((o) => o.id === c.organization_id)?.name ?? "org" : "Global"}</td>
                <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => remove(c.id)} className="text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="bg-white/5 border-white/10 h-fit">
        <CardHeader><CardTitle className="text-white text-base">Nova coleção</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Nome"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          <Field label="Slug (opcional)"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          <Field label="Descrição"><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className="bg-white/5 border-white/10 text-white" /></Field>
          <Field label="Escopo">
            <Select value={form.organization_id || "global"} onValueChange={(v) => setForm({ ...form, organization_id: v === "global" ? "" : v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="global">Global</SelectItem>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Button onClick={save} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Criar</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================ CATEGORIES */
function CategoriesTab({ categories, orgs, reload }: { categories: Category[]; orgs: Org[]; reload: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", organization_id: "" });
  const save = async () => {
    if (!form.name) return toast.error("Nome obrigatório");
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const { error } = await supabase.from("knowledge_categories").insert({
      name: form.name, slug, organization_id: form.organization_id || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Categoria criada");
    setForm({ name: "", slug: "", organization_id: "" });
    reload();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir categoria?")) return;
    const { error } = await supabase.from("knowledge_categories").delete().eq("id", id);
    if (error) return toast.error(error.message);
    reload();
  };
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <div className="border border-white/10 rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-white/60 text-xs uppercase"><tr><th className="text-left px-3 py-2">Nome</th><th className="text-left px-3 py-2">Slug</th><th className="text-left px-3 py-2">Escopo</th><th className="text-right px-3 py-2">Ações</th></tr></thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} className="border-t border-white/5">
                <td className="px-3 py-2 text-white">{c.name}</td>
                <td className="px-3 py-2 text-white/60 text-xs">{c.slug}</td>
                <td className="px-3 py-2 text-white/60 text-xs">{c.organization_id ? orgs.find((o) => o.id === c.organization_id)?.name ?? "org" : "Global"}</td>
                <td className="px-3 py-2 text-right"><Button size="sm" variant="ghost" onClick={() => remove(c.id)} className="text-red-400"><Trash2 className="w-3.5 h-3.5" /></Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Card className="bg-white/5 border-white/10 h-fit">
        <CardHeader><CardTitle className="text-white text-base">Nova categoria</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Nome"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          <Field label="Slug (opcional)"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="bg-white/5 border-white/10 text-white" /></Field>
          <Field label="Escopo">
            <Select value={form.organization_id || "global"} onValueChange={(v) => setForm({ ...form, organization_id: v === "global" ? "" : v })}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="global">Global</SelectItem>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
            </Select>
          </Field>
          <Button onClick={save} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">Criar</Button>
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================ SEARCH / RAG */
function SearchTab({ orgs }: { orgs: Org[] }) {
  const [query, setQuery] = useState("");
  const [org, setOrg] = useState("global");
  const [mode, setMode] = useState<"search" | "test">("search");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    if (!query.trim()) return;
    setBusy(true); setResult(null);
    const { data, error } = await supabase.functions.invoke("knowledge-search", {
      body: { query, organization_id: org === "global" ? null : org, mode, top_k: 6 },
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    setResult(data);
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white/5 border-white/10">
        <CardContent className="p-4 space-y-3">
          <Textarea placeholder="Pergunta ou consulta…" value={query} onChange={(e) => setQuery(e.target.value)} rows={2} className="bg-white/5 border-white/10 text-white" />
          <div className="flex gap-2 flex-wrap items-center">
            <Select value={org} onValueChange={setOrg}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="global">Global</SelectItem>{orgs.map((o) => <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={mode} onValueChange={(v) => setMode(v as any)}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white w-48"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="search">Busca (top-k)</SelectItem><SelectItem value="test">Chat RAG</SelectItem></SelectContent>
            </Select>
            <Button onClick={run} disabled={busy} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-4 h-4 mr-2" />Executar</>}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <div className="grid gap-4 lg:grid-cols-2">
          {result.answer && (
            <Card className="bg-white/5 border-white/10">
              <CardHeader><CardTitle className="text-white text-base flex items-center gap-2"><MessageSquare className="w-4 h-4" />Resposta</CardTitle></CardHeader>
              <CardContent><p className="text-sm text-white/80 whitespace-pre-wrap">{result.answer}</p></CardContent>
            </Card>
          )}
          <Card className="bg-white/5 border-white/10">
            <CardHeader>
              <CardTitle className="text-white text-base flex items-center justify-between">
                <span>Fontes ({result.sources?.length ?? 0})</span>
                <span className="text-xs font-normal text-white/50">Conf.: {Number(result.confidence ?? 0).toFixed(2)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[500px] overflow-auto">
              {(result.sources ?? []).map((s: any, i: number) => (
                <div key={i} className="border border-white/10 rounded p-2">
                  <div className="text-xs text-white/40 flex justify-between"><span>[Fonte {i + 1}] {s.document_title}</span><span>{Number(s.similarity).toFixed(3)}</span></div>
                  <p className="text-xs text-white/70 mt-1 line-clamp-4">{s.content}</p>
                </div>
              ))}
              {result.sources?.length === 0 && <p className="text-xs text-white/40">Nenhum trecho relevante.</p>}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ============================================================ LOGS */
function LogsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [usage, setUsage] = useState<any[]>([]);
  useEffect(() => {
    supabase.from("knowledge_logs").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setLogs(data ?? []));
    supabase.from("knowledge_usage").select("*").order("created_at", { ascending: false }).limit(100).then(({ data }) => setUsage(data ?? []));
  }, []);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-white text-base">Ações recentes</CardTitle></CardHeader>
        <CardContent className="max-h-[560px] overflow-auto space-y-1">
          {logs.length === 0 && <p className="text-xs text-white/40">Nenhum log.</p>}
          {logs.map((l) => (
            <div key={l.id} className="text-xs text-white/70 border-b border-white/5 py-1.5 flex justify-between">
              <span>{l.action}</span>
              <span className="text-white/40">{new Date(l.created_at).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-white text-base">Uso RAG por IA</CardTitle></CardHeader>
        <CardContent className="max-h-[560px] overflow-auto space-y-1">
          {usage.length === 0 && <p className="text-xs text-white/40">Nenhum uso registrado.</p>}
          {usage.map((u) => (
            <div key={u.id} className="text-xs text-white/70 border-b border-white/5 py-1.5 flex justify-between">
              <span>{u.ai_module} · {u.chunks_used} chunks</span>
              <span className="text-white/40">{new Date(u.created_at).toLocaleString("pt-BR")}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============================================================ DASHBOARD */
function DashboardTab({ docs }: { docs: Doc[] }) {
  const stats = useMemo(() => {
    const total = docs.length;
    const indexed = docs.filter((d) => d.status === "indexed").length;
    const errors = docs.filter((d) => d.status === "error").length;
    const published = docs.filter((d) => d.is_published).length;
    const chunks = docs.reduce((s, d) => s + (d.chunk_count || 0), 0);
    const avgQ = total ? docs.reduce((s, d) => s + Number(d.quality_score || 0), 0) / total : 0;
    const byType: Record<string, number> = {};
    docs.forEach((d) => { byType[d.doc_type] = (byType[d.doc_type] || 0) + 1; });
    return { total, indexed, errors, published, chunks, avgQ, byType };
  }, [docs]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-6">
        <Kpi label="Documentos" value={stats.total} />
        <Kpi label="Indexados" value={stats.indexed} />
        <Kpi label="Publicados" value={stats.published} />
        <Kpi label="Erros" value={stats.errors} accent={stats.errors > 0 ? "danger" : undefined} />
        <Kpi label="Chunks" value={stats.chunks} />
        <Kpi label="Qualidade média" value={stats.avgQ.toFixed(2)} />
      </div>
      <Card className="bg-white/5 border-white/10">
        <CardHeader><CardTitle className="text-white text-base">Distribuição por tipo</CardTitle></CardHeader>
        <CardContent className="grid gap-2 md:grid-cols-4">
          {Object.entries(stats.byType).map(([k, v]) => (
            <div key={k} className="border border-white/10 rounded p-2 flex justify-between">
              <span className="text-white/70 text-xs uppercase">{k}</span>
              <span className="text-white font-semibold">{v}</span>
            </div>
          ))}
          {Object.keys(stats.byType).length === 0 && <p className="text-xs text-white/40">Sem dados.</p>}
        </CardContent>
      </Card>
    </div>
  );
}

function Kpi({ label, value, accent }: { label: string; value: any; accent?: "danger" }) {
  return (
    <div className={`border rounded-lg p-3 ${accent === "danger" ? "border-red-500/30 bg-red-500/5" : "border-white/10 bg-white/5"}`}>
      <div className="text-[10px] uppercase text-white/40 tracking-widest">{label}</div>
      <div className="text-2xl font-black text-white mt-1">{value}</div>
    </div>
  );
}