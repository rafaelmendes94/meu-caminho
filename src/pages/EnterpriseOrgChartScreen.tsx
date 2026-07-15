import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { EnterpriseRHLayout } from "@/components/EnterpriseRHNavigation";
import { ChevronRight, ChevronDown, Users, RefreshCw, ShieldCheck, BarChart3, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useOrgMinGroupSize } from "@/hooks/useOrgMinGroupSize";
import { useRealtime } from "@/hooks/useRealtime";

type Node = {
  profile_id: string;
  full_name: string | null;
  job_title: string | null;
  department_name: string | null;
  unit_name: string | null;
  manager_id: string | null;
  level: number;
  direct_reports_count: number;
  total_reports_count: number;
  status: string | null;
};

type Indicators = {
  participants_count: number;
  avg_mood: number | null;
  avg_energy: number | null;
  avg_stress: number | null;
  equilibrium_index: number | null;
  pulse_energy: number | null;
  pulse_engagement: number | null;
  pulse_communication: number | null;
  pulse_equilibrium: number | null;
  pulse_recovery: number | null;
};

const fmt = (v: number | null | undefined) =>
  v === null || v === undefined ? "•••" : Number(v).toFixed(2);

function buildTree(nodes: Node[]) {
  const byId = new Map<string, Node & { children: Node[] }>();
  nodes.forEach((n) => byId.set(n.profile_id, { ...n, children: [] }));
  const roots: (Node & { children: Node[] })[] = [];
  nodes.forEach((n) => {
    const node = byId.get(n.profile_id)!;
    if (n.manager_id && byId.has(n.manager_id)) {
      byId.get(n.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function NodeRow({
  node,
  onSelect,
  selectedId,
  depth = 0,
}: {
  node: Node & { children: Node[] };
  onSelect: (id: string) => void;
  selectedId: string | null;
  depth?: number;
}) {
  const [open, setOpen] = useState(depth < 2);
  const hasChildren = node.children.length > 0;
  const active = selectedId === node.profile_id;
  return (
    <div>
      <div
        className={`flex items-center gap-3 py-3 px-4 rounded-2xl border transition-all ${
          active ? "border-[#F88A2B] bg-[#F88A2B]/5" : "border-black/5 bg-white hover:border-black/10"
        }`}
        style={{ marginLeft: depth * 20 }}
      >
        <button
          onClick={() => setOpen((o) => !o)}
          className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-black/5"
          disabled={!hasChildren}
        >
          {hasChildren ? (open ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />) : <span className="h-1.5 w-1.5 rounded-full bg-black/20" />}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-bold text-[#111] truncate">{node.full_name ?? "Sem nome"}</p>
            {node.status && node.status !== "active" && (
              <span className="text-[10px] uppercase tracking-widest text-black/40 px-2 py-0.5 rounded-full bg-black/5">{node.status}</span>
            )}
          </div>
          <p className="text-[11px] text-black/50 truncate">
            {[node.job_title, node.department_name, node.unit_name].filter(Boolean).join(" · ") || "—"}
          </p>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-black/50 shrink-0">
          <Users className="h-3 w-3" />
          {node.direct_reports_count} / {node.total_reports_count}
        </div>
        <button
          onClick={() => onSelect(node.profile_id)}
          className="text-[10px] uppercase tracking-widest font-bold text-[#F88A2B] hover:text-[#d97406] flex items-center gap-1 shrink-0"
        >
          <BarChart3 className="h-3 w-3" /> Indicadores
        </button>
      </div>
      {open && hasChildren && (
        <div className="mt-2 space-y-2">
          {node.children.map((c) => (
            <NodeRow key={c.profile_id} node={c as Node & { children: Node[] }} onSelect={onSelect} selectedId={selectedId} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function EnterpriseOrgChartScreen() {
  const { organization } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const minGroup = useOrgMinGroupSize();
  const [nodes, setNodes] = useState<Node[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [indicators, setIndicators] = useState<Indicators | null>(null);
  const [snapping, setSnapping] = useState(false);

  const load = async () => {
    if (!organization?.id) return;
    setLoading(true);
    const { data, error } = await supabase.rpc("org_tree", { _organization_id: organization.id });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setNodes((data as unknown as Node[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [organization?.id]);

  useRealtime(
    `orgchart-${organization?.id ?? "none"}`,
    organization?.id
      ? [
          { table: "profiles", filter: `organization_id=eq.${organization.id}` },
          { table: "departments", filter: `organization_id=eq.${organization.id}` },
          { table: "units", filter: `organization_id=eq.${organization.id}` },
        ]
      : [],
    () => { void load(); },
    [organization?.id]
  );

  const tree = useMemo(() => buildTree(nodes), [nodes]);
  const orphans = useMemo(
    () =>
      nodes.filter(
        (n) =>
          !n.manager_id &&
          n.status !== "inactive" &&
          n.direct_reports_count === 0,
      ),
    [nodes],
  );
  const selectedNode = useMemo(() => nodes.find((n) => n.profile_id === selectedId) ?? null, [nodes, selectedId]);

  const loadIndicators = async (id: string) => {
    if (!organization?.id) return;
    setSelectedId(id);
    setIndicators(null);
    const { data, error } = await supabase.rpc("org_node_indicators", {
      _organization_id: organization.id,
      _profile_id: id,
      _days: 30,
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else setIndicators(data as unknown as Indicators);
  };

  const snapshot = async () => {
    setSnapping(true);
    const { error } = await supabase.functions.invoke("snapshot-org-chart");
    if (error) toast({ title: "Erro no snapshot", description: error.message, variant: "destructive" });
    else toast({ title: "Snapshot salvo" });
    setSnapping(false);
  };

  return (
    <EnterpriseRHLayout title="Organograma Vivo™">
      <div className="space-y-8 animate-fade-in">
        <section className="rounded-[32px] bg-white border border-black/5 p-8 md:p-10 shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span className="px-3 py-1 rounded-full bg-[#F88A2B]/10 text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] border border-[#F88A2B]/20">
                Organograma Vivo™
              </span>
              <h2 className="text-[28px] md:text-[36px] font-bold mt-4 leading-tight" style={{ fontFamily: "'Playfair Display', serif" }}>
                A empresa que respira em tempo real.
              </h2>
              <p className="text-[14px] text-[#666] mt-3 max-w-2xl">
                Estrutura hierárquica atual com indicadores agregados por nó. Nenhuma resposta individual é exibida.
              </p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button
                onClick={load}
                disabled={loading}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#666] hover:text-[#111]"
              >
                <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} /> Recarregar
              </button>
              <button
                onClick={snapshot}
                disabled={snapping}
                className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-[#F88A2B] hover:text-[#d97406]"
              >
                <ShieldCheck className="h-3 w-3" /> Salvar snapshot
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 space-y-2">
            {orphans.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 flex items-start gap-3 mb-3">
                <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-amber-900">
                    {orphans.length} colaborador{orphans.length > 1 ? "es" : ""} sem gestor definido
                  </p>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Aparecem como raízes soltas na árvore. Defina um gestor imediato para cada um em Administração de colaboradores para que a hierarquia fique consistente.
                  </p>
                  <details className="mt-2">
                    <summary className="text-[11px] font-bold text-amber-900 cursor-pointer hover:underline">
                      Ver lista
                    </summary>
                    <ul className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {orphans.map((o) => (
                        <li key={o.profile_id} className="text-[12px] text-amber-900 flex items-center justify-between gap-2">
                          <span className="truncate">
                            {o.full_name ?? "Sem nome"} · {o.job_title ?? "—"}
                          </span>
                          <button
                            onClick={() => navigate(`/enterprise/rh/equipe/${o.profile_id}`)}
                            className="text-[10px] font-bold uppercase tracking-widest text-amber-700 hover:text-amber-900 shrink-0"
                          >
                            Corrigir
                          </button>
                        </li>
                      ))}
                    </ul>
                  </details>
                </div>
              </div>
            )}
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] px-1">Hierarquia</h3>
            {tree.length === 0 && !loading && (
              <div className="rounded-3xl bg-white border border-black/5 p-10 text-center text-[#666]">
                Nenhum colaborador cadastrado ainda.
              </div>
            )}
            <div className="space-y-2">
              {tree.map((n) => (
                <NodeRow key={n.profile_id} node={n} onSelect={loadIndicators} selectedId={selectedId} />
              ))}
            </div>
          </section>

          <section className="lg:col-span-1">
            <h3 className="text-[12px] font-bold uppercase tracking-widest text-[#999] px-1 mb-2">Indicadores agregados</h3>
            <div className="rounded-3xl bg-white border border-black/5 p-6 shadow-sm min-h-[300px]">
              {!selectedNode ? (
                <p className="text-[13px] text-[#666]">Selecione um nó da árvore para ver indicadores agregados do time.</p>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-[16px] font-bold text-[#111]">{selectedNode.full_name}</p>
                    <p className="text-[11px] text-[#666]">
                      {selectedNode.total_reports_count} liderados totais · {selectedNode.direct_reports_count} diretos
                    </p>
                  </div>
                  {indicators ? (
                    <>
                      <div className="grid grid-cols-2 gap-3">
                        <Metric label="Participantes" value={String(indicators.participants_count)} />
                        <Metric label="Equilíbrio" value={fmt(indicators.equilibrium_index)} />
                        <Metric label="Humor" value={fmt(indicators.avg_mood)} />
                        <Metric label="Energia" value={fmt(indicators.avg_energy)} />
                        <Metric label="Estresse" value={fmt(indicators.avg_stress)} />
                        <Metric label="Engajamento" value={fmt(indicators.pulse_engagement)} />
                        <Metric label="Comunicação" value={fmt(indicators.pulse_communication)} />
                        <Metric label="Recuperação" value={fmt(indicators.pulse_recovery)} />
                      </div>
                      {indicators.participants_count < minGroup && (
                        <p className="text-[11px] text-[#F88A2B] italic">
                          Amostra insuficiente para exibição segura.
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="text-[13px] text-[#999]">Carregando…</p>
                  )}
                </div>
              )}
            </div>
          </section>
        </div>

        <p className="text-[11px] text-[#999] italic text-center pt-4">
          Indicadores por equipe são exibidos apenas com amostra mínima de {minGroup} participantes. O RH nunca acessa respostas individuais.
        </p>
      </div>
    </EnterpriseRHLayout>
  );
}

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-black/5 p-3">
    <p className="text-[9px] font-bold uppercase tracking-widest text-black/40">{label}</p>
    <p className="text-[18px] font-bold text-[#111] mt-1">{value}</p>
  </div>
);