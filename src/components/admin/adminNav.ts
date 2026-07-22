import {
  LayoutDashboard, Building2, Package, CreditCard, Wallet,
  BookOpen, GraduationCap, Video, Podcast, Route as RouteIcon, ListChecks,
  Tags, Users, FolderKanban, Brain, MessageSquare, Dna, CalendarClock,
  Sparkles, Wand2, FileText, FlaskConical, Activity, Settings, ShieldCheck,
  DatabaseBackup, Gauge, ClipboardCheck, BarChart3, LifeBuoy, Layers, Import, Music,
  Award, HelpCircle, History, Heart, Sparkle, MessageCircle,
  Trophy,
} from "lucide-react";

export type AdminNavItem = {
  to: string;
  label: string;
  icon: any;
  keywords?: string;
};
export type AdminNavGroup = {
  key: string;
  label: string;
  icon?: any;
  collapsible?: boolean;
  items: AdminNavItem[];
};

// Estrutura canônica do menu do Super Admin (Fase 22).
export const adminNavGroups: AdminNavGroup[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    items: [
      { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard, keywords: "home visão geral" },
      { to: "/admin/analytics", label: "Analytics", icon: BarChart3, keywords: "métricas kpi" },
    ],
  },
  {
    key: "empresas",
    label: "Empresas",
    icon: Building2,
    collapsible: true,
    items: [
      { to: "/admin/organizations", label: "Empresas", icon: Building2, keywords: "clientes organizações tenants" },
      { to: "/admin/subscriptions", label: "Licenças", icon: CreditCard, keywords: "assinaturas seats" },
      { to: "/admin/plans", label: "Planos", icon: Package, keywords: "pricing planos" },
      { to: "/admin/billing", label: "Billing", icon: Wallet, keywords: "financeiro faturamento" },
      { to: "/admin/billing/hub", label: "Billing Hub", icon: Wallet, keywords: "assinaturas cupons add-ons faturas webhooks gateways" },
    ],
  },
  {
    key: "conteudo",
    label: "Conteúdo",
    icon: FolderKanban,
    collapsible: true,
    items: [
      { to: "/admin/content", label: "Overview", icon: LayoutDashboard },
      { to: "/admin/content/books", label: "Livros", icon: BookOpen },
      { to: "/admin/content/courses", label: "Cursos", icon: GraduationCap },
      { to: "/admin/content/videos", label: "Vídeos", icon: Video },
      { to: "/admin/content/podcasts", label: "Podcasts", icon: Podcast },
      { to: "/admin/content/tracks", label: "Trilhas", icon: RouteIcon },
      { to: "/admin/content/audios", label: "Áudios", icon: Music },
      { to: "/admin/content/materials", label: "Materiais", icon: FileText },
      { to: "/admin/content/categories", label: "Categorias", icon: Tags },
      { to: "/admin/content/authors", label: "Autores", icon: Users },
      { to: "/admin/content/collections", label: "Coleções", icon: Layers },
      { to: "/admin/content/tags", label: "Tags", icon: Tags },
      { to: "/admin/content/library", label: "Biblioteca", icon: FolderKanban },
      { to: "/admin/content/hub", label: "CMS Hub", icon: FolderKanban, keywords: "cms enterprise conteúdo hub" },
      { to: "/admin/content/competencies", label: "Competências", icon: Sparkle },
      { to: "/admin/content/emotions", label: "Emoções", icon: Heart },
      { to: "/admin/content/reflections", label: "Reflexões", icon: MessageCircle },
      { to: "/admin/content/messages", label: "Mensagens", icon: MessageSquare },
      { to: "/admin/content/quizzes", label: "Quizzes", icon: HelpCircle },
      { to: "/admin/content/certificates", label: "Certificados", icon: Award },
      { to: "/admin/content/versions", label: "Versionamento", icon: History },
      { to: "/admin/content/analytics", label: "Analytics", icon: BarChart3 },
      { to: "/admin/content/imports", label: "Importações", icon: Import },
    ],
  },
  {
    key: "ia",
    label: "IA",
    icon: Brain,
    collapsible: true,
    items: [
      { to: "/admin/ai", label: "Overview", icon: LayoutDashboard },
      { to: "/admin/ai/orchestrator", label: "Orchestrator", icon: Brain },
      { to: "/admin/ai/onboarding", label: "Onboarding", icon: MessageSquare, keywords: "entrevista colaborador perfil inteligente" },
      { to: "/admin/ai/conselho-executivo", label: "Conselho", icon: MessageSquare },
      { to: "/admin/ai/dna-organizacional", label: "DNA", icon: Dna },
      { to: "/admin/ai/insights-semanais", label: "Insights", icon: CalendarClock },
      { to: "/admin/ai/planos-acao", label: "Planos", icon: ListChecks },
      { to: "/admin/ai/rituais-inteligentes", label: "Rituais", icon: Sparkles },
      { to: "/admin/ai/recomendacoes", label: "Recomendações", icon: Wand2 },
      { to: "/admin/knowledge", label: "Knowledge Hub", icon: FileText },
      { to: "/admin/ai-usage", label: "Observability", icon: Activity, keywords: "observability tokens uso" },
      { to: "/admin/ai/provider", label: "Provedor (Gemini)", icon: Brain, keywords: "gemini api key modelos provider" },
      { to: "/admin/ai/lab", label: "AI Lab", icon: FlaskConical },
    ],
  },
  {
    key: "sistema",
    label: "Gamification",
    icon: Trophy,
    collapsible: true,
    items: [
      { to: "/admin/gamification", label: "Dashboard", icon: LayoutDashboard, keywords: "gamificação xp missões" },
      { to: "/admin/gamification/xp", label: "XP", icon: Sparkles, keywords: "xp regras" },
      { to: "/admin/gamification/levels", label: "Níveis", icon: Trophy },
      { to: "/admin/gamification/badges", label: "Badges", icon: Award },
      { to: "/admin/gamification/missions", label: "Missões", icon: ListChecks },
      { to: "/admin/gamification/achievements", label: "Conquistas", icon: Sparkles },
      { to: "/admin/gamification/seasons", label: "Temporadas", icon: CalendarClock },
      { to: "/admin/gamification/events", label: "Eventos", icon: Sparkle },
      { to: "/admin/gamification/settings", label: "Configurações", icon: Settings },
    ],
  },
  {
    key: "sistema",
    label: "Sistema",
    icon: Settings,
    collapsible: true,
    items: [
      { to: "/admin/system", label: "System Health", icon: Activity },
      { to: "/admin/settings", label: "Configurações", icon: Settings },
      { to: "/admin/audit", label: "Logs", icon: ShieldCheck, keywords: "auditoria" },
      { to: "/admin/system/qa", label: "QA", icon: ClipboardCheck },
      { to: "/admin/system/performance", label: "Performance", icon: Gauge },
      { to: "/admin/system/backup", label: "Backup", icon: DatabaseBackup },
      { to: "/admin/support", label: "Suporte", icon: LifeBuoy },
    ],
  },
];

export function flattenAdminNav(): AdminNavItem[] {
  return adminNavGroups.flatMap((g) => g.items);
}