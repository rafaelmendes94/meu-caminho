import {
  LayoutDashboard, Gauge, Sparkles, Settings, Users, UserPlus, KeyRound, Users2,
  Package, Network, Dna, AlertTriangle, Map, Activity, FileText, Zap, Send,
  TrendingUp, ShieldCheck, Lock, Layers, Globe, Wallet, Plug, Brain, MessageSquare,
} from "lucide-react";

export type RHNavItem = { to: string; label: string; icon: any; keywords?: string };
export type RHNavGroup = { key: string; label: string; icon?: any; items: RHNavItem[] };

export const rhNavGroups: RHNavGroup[] = [
  {
    key: "overview",
    label: "Visão Geral",
    items: [
      { to: "/enterprise/rh/dashboard", label: "Dashboard", icon: LayoutDashboard, keywords: "home cockpit resumo" },
      { to: "/enterprise/rh/score-organizacional", label: "Score Organizacional", icon: Gauge, keywords: "score saúde" },
      { to: "/enterprise/rh/insights-semanais", label: "Insights Semanais", icon: Sparkles },
    ],
  },
  {
    key: "company",
    label: "Empresa",
    icon: Settings,
    items: [
      { to: "/enterprise/rh/central-admin", label: "Central Admin", icon: Settings },
      { to: "/enterprise/rh/equipe", label: "Equipe", icon: Users, keywords: "colaboradores time" },
      { to: "/enterprise/rh/equipe/convidar", label: "Convites", icon: UserPlus },
      { to: "/enterprise/rh/equipe/licencas", label: "Licenças", icon: KeyRound, keywords: "seats" },
      { to: "/enterprise/rh/departamentos", label: "Departamentos", icon: Users2 },
      { to: "/enterprise/rh/unidades", label: "Unidades", icon: Package },
      { to: "/enterprise/rh/organograma", label: "Organograma", icon: Network },
    ],
  },
  {
    key: "intel",
    label: "Inteligência",
    icon: Brain,
    items: [
      { to: "/enterprise/rh/dna-organizacional", label: "DNA Organizacional", icon: Dna },
      { to: "/enterprise/rh/conselho-executivo", label: "Conselho Executivo", icon: MessageSquare },
      { to: "/enterprise/rh/insights-ia", label: "Inteligência Preditiva", icon: Sparkles },
      { to: "/enterprise/rh/alertas", label: "Alertas", icon: AlertTriangle },
      { to: "/enterprise/rh/mapa-emocional", label: "Mapa Emocional", icon: Map },
      { to: "/enterprise/rh/capacidade", label: "Capacidade", icon: Activity },
    ],
  },
  {
    key: "actions",
    label: "Ações",
    items: [
      { to: "/enterprise/rh/plano-acao", label: "Planos de Ação", icon: FileText },
      { to: "/enterprise/rh/rituais-inteligentes", label: "Rituais Inteligentes", icon: Zap },
      { to: "/enterprise/rh/comunicados", label: "Comunicados", icon: Send },
      { to: "/enterprise/rh/impacto", label: "Motor de Impacto", icon: TrendingUp },
    ],
  },
  {
    key: "governance",
    label: "Governança",
    items: [
      { to: "/enterprise/rh/compliance", label: "Compliance", icon: ShieldCheck },
      { to: "/enterprise/rh/privacidade", label: "Privacidade", icon: Lock },
      { to: "/enterprise/rh/retencao-dados", label: "Retenção", icon: Layers },
      { to: "/enterprise/rh/auditoria", label: "Auditoria", icon: FileText },
      { to: "/enterprise/rh/permissoes", label: "Permissões", icon: KeyRound },
      { to: "/enterprise/rh/multiplos-admins", label: "Multi Admins", icon: Users2 },
      { to: "/enterprise/rh/dominio", label: "Domínio", icon: Globe },
    ],
  },
  {
    key: "settings",
    label: "Configurações",
    items: [
      { to: "/enterprise/rh/configuracoes", label: "Configurações", icon: Settings },
      { to: "/enterprise/rh/integracoes", label: "Integrações", icon: Plug },
      { to: "/enterprise/rh/billing", label: "Billing", icon: Wallet },
    ],
  },
];

export const flattenRHNav = () => rhNavGroups.flatMap((g) => g.items);