import { ReactNode } from "react";
import { AlertTriangle, Copy, RotateCcw, FileText, Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Fase 22 — primitivas visuais padronizadas do Super Admin.
// Sem lógica de negócio. Apenas UX/consistência.

type StatusTone =
  | "active" | "inactive" | "published" | "draft" | "archived" | "error"
  | "pending" | "success" | "warning" | "info";

const TONE: Record<StatusTone, { bg: string; fg: string; ring: string; label: string }> = {
  active:     { bg: "bg-emerald-50", fg: "text-emerald-700", ring: "ring-emerald-200", label: "Ativo" },
  success:    { bg: "bg-emerald-50", fg: "text-emerald-700", ring: "ring-emerald-200", label: "Sucesso" },
  published:  { bg: "bg-emerald-50", fg: "text-emerald-700", ring: "ring-emerald-200", label: "Publicado" },
  inactive:   { bg: "bg-slate-100",  fg: "text-slate-600",   ring: "ring-slate-200",   label: "Inativo" },
  draft:      { bg: "bg-amber-50",   fg: "text-amber-700",   ring: "ring-amber-200",   label: "Rascunho" },
  warning:    { bg: "bg-amber-50",   fg: "text-amber-700",   ring: "ring-amber-200",   label: "Aviso" },
  pending:    { bg: "bg-blue-50",    fg: "text-blue-700",    ring: "ring-blue-200",    label: "Pendente" },
  info:       { bg: "bg-blue-50",    fg: "text-blue-700",    ring: "ring-blue-200",    label: "Info" },
  archived:   { bg: "bg-slate-100",  fg: "text-slate-500",   ring: "ring-slate-200",   label: "Arquivado" },
  error:      { bg: "bg-red-50",     fg: "text-red-700",     ring: "ring-red-200",     label: "Erro" },
};

export function StatusBadge({ tone, children }: { tone: StatusTone; children?: ReactNode }) {
  const t = TONE[tone];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ring-1 ${t.bg} ${t.fg} ${t.ring}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
      {children || t.label}
    </span>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
}: {
  icon?: any;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 grid place-items-center mb-4">
        <Icon className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      {description && <p className="mt-1 text-sm text-slate-500 max-w-md">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({
  title = "Não foi possível carregar",
  message,
  onRetry,
  logHref,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  logHref?: string;
}) {
  const copy = () => { if (message) navigator.clipboard?.writeText(message).catch(() => {}); };
  return (
    <div className="rounded-xl border border-red-200 bg-red-50/60 p-5">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">{title}</p>
          {message && <p className="mt-1 text-xs text-red-700 break-all">{message}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {onRetry && (
              <button onClick={onRetry} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-700 bg-white ring-1 ring-red-200 rounded-md px-2.5 py-1 hover:bg-red-50">
                <RotateCcw className="w-3.5 h-3.5" /> Tentar novamente
              </button>
            )}
            {message && (
              <button onClick={copy} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-700 bg-white ring-1 ring-red-200 rounded-md px-2.5 py-1 hover:bg-red-50">
                <Copy className="w-3.5 h-3.5" /> Copiar erro
              </button>
            )}
            {logHref && (
              <a href={logHref} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-red-700 bg-white ring-1 ring-red-200 rounded-md px-2.5 py-1 hover:bg-red-50">
                <FileText className="w-3.5 h-3.5" /> Abrir log
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      <div className="grid gap-3 p-4 border-b border-slate-100" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-3 w-2/3" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-3 p-4 border-b border-slate-50 last:border-0" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0,1fr))` }}>
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-4 w-4/5" />)}
        </div>
      ))}
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-3 w-72" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
      </div>
      <TableSkeleton />
    </div>
  );
}

export function AdminToolbar({
  left, right,
}: { left?: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
      <div className="flex flex-wrap items-center gap-2 min-w-0">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}