export type ReportStatus = "new" | "read" | "replied";
export type ReportPriority = "high" | "medium" | "low";

export interface ReportTimelineEvent {
  date: string;
  time: string;
  title: string;
  description: string;
  type: "received" | "read" | "action" | "reply";
}

export interface EnterpriseReport {
  id: string;
  date: string;
  time: string;
  reason: string;
  message: string;
  status: ReportStatus;
  priority: ReportPriority;
  category: string;
  channel: string;
  department: string;
  isAnonymous: boolean;
  attachments: number;
  timeline: ReportTimelineEvent[];
}

export const enterpriseReports: EnterpriseReport[] = [
  {
    id: "REP-001",
    date: "14/05/2026",
    time: "09:23",
    reason: "Estou passando por uma situação de assédio",
    message:
      "Gostaria de falar em particular sobre uma conduta inapropriada que vem ocorrendo no meu departamento. Prefiro manter o anonimato neste primeiro momento. A situação tem se repetido há algumas semanas e está afetando meu rendimento e bem-estar emocional. Peço discrição e orientação sobre os próximos passos.",
    status: "new",
    priority: "high",
    category: "Assédio moral",
    channel: "Canal Direto (App)",
    department: "Não informado",
    isAnonymous: true,
    attachments: 0,
    timeline: [
      {
        date: "14/05/2026",
        time: "09:23",
        title: "Relato recebido",
        description: "O colaborador enviou a mensagem pelo Canal Direto de forma anônima.",
        type: "received",
      },
    ],
  },
  {
    id: "REP-002",
    date: "12/05/2026",
    time: "16:47",
    reason: "Sinto que o ambiente está tóxico",
    message:
      "A pressão por resultados tem passado dos limites saudáveis. Muitas pessoas estão saindo chorando e isso está afetando o clima de todos. Sinto que precisamos rever a forma como as metas são cobradas e o tom usado em reuniões.",
    status: "read",
    priority: "medium",
    category: "Clima organizacional",
    channel: "Canal Direto (App)",
    department: "Comercial",
    isAnonymous: true,
    attachments: 0,
    timeline: [
      {
        date: "12/05/2026",
        time: "16:47",
        title: "Relato recebido",
        description: "Mensagem registrada no Canal Direto.",
        type: "received",
      },
      {
        date: "13/05/2026",
        time: "08:12",
        title: "Lida pelo RH",
        description: "Marcada como lida por Ana Souza (RH).",
        type: "read",
      },
    ],
  },
  {
    id: "REP-003",
    date: "10/05/2026",
    time: "21:05",
    reason: "Preciso de ajuda — assunto sensível",
    message:
      "Preciso de orientações sobre como lidar com um conflito ético que presenciei. É algo delicado envolvendo prazos e faturamento. Posso fornecer mais detalhes em uma conversa privada, se necessário.",
    status: "read",
    priority: "high",
    category: "Ética e conduta",
    channel: "Canal Direto (App)",
    department: "Financeiro",
    isAnonymous: true,
    attachments: 1,
    timeline: [
      {
        date: "10/05/2026",
        time: "21:05",
        title: "Relato recebido",
        description: "Mensagem registrada com anexo.",
        type: "received",
      },
      {
        date: "11/05/2026",
        time: "09:30",
        title: "Encaminhado para Compliance",
        description: "Caso direcionado para análise pelo time de Compliance.",
        type: "action",
      },
    ],
  },
  {
    id: "REP-004",
    date: "08/05/2026",
    time: "14:18",
    reason: "Quero relatar algo com sigilo",
    message:
      "Gostaria de sugerir melhorias no processo de feedback, pois sinto que as pessoas têm medo de falar a verdade nas reuniões abertas. Acredito que canais alternativos podem ajudar.",
    status: "replied",
    priority: "low",
    category: "Sugestão de melhoria",
    channel: "Canal Direto (App)",
    department: "Operações",
    isAnonymous: true,
    attachments: 0,
    timeline: [
      {
        date: "08/05/2026",
        time: "14:18",
        title: "Relato recebido",
        description: "Mensagem registrada no Canal Direto.",
        type: "received",
      },
      {
        date: "08/05/2026",
        time: "17:02",
        title: "Lida pelo RH",
        description: "Marcada como lida por Bruno Lima (RH).",
        type: "read",
      },
      {
        date: "09/05/2026",
        time: "10:15",
        title: "Resposta enviada",
        description: "RH respondeu pelo canal anônimo agradecendo a sugestão.",
        type: "reply",
      },
    ],
  },
];

export function getReportById(id: string) {
  return enterpriseReports.find((r) => r.id === id);
}
