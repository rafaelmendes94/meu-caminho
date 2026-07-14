/**
 * Single source of truth for the employee (colaborador) navigation
 * used by the global search / command palette. Do NOT wire this into
 * BottomNav — the existing mobile nav is intentionally minimal.
 */

export interface EmployeeNavItem {
  label: string;
  path: string;
  group: "jornada" | "conteudo" | "bem-estar" | "conta";
  keywords?: string[];
}

export const EMPLOYEE_NAV: EmployeeNavItem[] = [
  { label: "Início", path: "/", group: "jornada", keywords: ["home", "dashboard"] },
  { label: "Trilha personalizada", path: "/trilha", group: "jornada", keywords: ["jornada", "roadmap"] },
  { label: "Evolução pessoal", path: "/evolucao", group: "jornada", keywords: ["progresso"] },
  { label: "Conquistas", path: "/conquistas", group: "jornada" },

  { label: "Biblioteca", path: "/biblioteca", group: "conteudo", keywords: ["livros", "clube"] },
  { label: "Feed de conteúdo", path: "/feed", group: "conteudo", keywords: ["novidades"] },
  { label: "Explorar", path: "/explorar", group: "conteudo", keywords: ["descobrir"] },
  { label: "Cursos", path: "/cursos", group: "conteudo" },
  { label: "Áudios", path: "/audios", group: "conteudo", keywords: ["podcast"] },
  { label: "Vídeos", path: "/videos", group: "conteudo" },
  { label: "Favoritos", path: "/favoritos", group: "conteudo" },
  { label: "Downloads", path: "/downloads", group: "conteudo" },

  { label: "Cury Digital (IA)", path: "/cury-digital", group: "bem-estar", keywords: ["ia", "chat"] },
  { label: "Check-in emocional", path: "/checkin", group: "bem-estar", keywords: ["humor"] },
  { label: "Pulse", path: "/pulse", group: "bem-estar" },

  { label: "Meu perfil", path: "/perfil", group: "conta" },
  { label: "Minha privacidade", path: "/privacidade", group: "conta", keywords: ["lgpd"] },
  { label: "Notificações", path: "/notificacoes", group: "conta" },
];

export const EMPLOYEE_GROUP_LABEL: Record<EmployeeNavItem["group"], string> = {
  jornada: "Jornada",
  conteudo: "Conteúdo",
  "bem-estar": "Bem-estar",
  conta: "Conta",
};