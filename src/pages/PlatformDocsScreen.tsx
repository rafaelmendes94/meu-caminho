import { useSearchParams } from "react-router-dom";
import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { BookOpen, ShieldCheck, Sparkles, GraduationCap, FileText, LifeBuoy } from "lucide-react";

const DOCS = [
  { id: "architecture", title: "Arquitetura da Plataforma", icon: FileText, body: "Visão geral dos módulos, camadas e integrações. Consulte ADMIN_ARCHITECTURE.md e SYSTEM_ARCHITECTURE.md." },
  { id: "rls", title: "RLS e Segurança", icon: ShieldCheck, body: "Políticas de row-level security por perfil. Consulte RLS.md e SECURITY_REPORT.md." },
  { id: "edge-functions", title: "Edge Functions", icon: Sparkles, body: "Referência de todas as funções serverless. Consulte EDGE_FUNCTIONS.md e ADMIN_EDGE_FUNCTIONS.md." },
  { id: "cms", title: "CMS / Content Studio", icon: GraduationCap, body: "Como cadastrar livros, cursos, trilhas, podcasts, vídeos, áudios e materiais." },
  { id: "shortcuts", title: "Atalhos", icon: FileText, body: "Enter na busca abre a página completa /admin/search." },
  { id: "support", title: "Suporte técnico", icon: LifeBuoy, body: "Acesse /admin/support para gerir tickets de organizações." },
];

export default function PlatformDocsScreen() {
  const [sp] = useSearchParams();
  const active = sp.get("doc");
  const target = DOCS.find((d) => d.id === active);

  return (
    <PlatformAdminLayout>
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="w-6 h-6 text-slate-500" />
        <div>
          <h1 className="text-2xl font-black text-slate-900">Documentação da Plataforma</h1>
          <p className="text-xs text-slate-500">Índice de referência para o Super Admin</p>
        </div>
      </div>
      {target ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-3">
            <target.icon className="w-5 h-5 text-[#F88A2B]" />
            <h2 className="text-lg font-bold text-slate-900">{target.title}</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">{target.body}</p>
          <a href="/admin/docs" className="mt-4 inline-block text-xs font-semibold text-slate-500 hover:text-slate-800">← Voltar ao índice</a>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {DOCS.map((d) => (
            <a key={d.id} href={`/admin/docs?doc=${d.id}`} className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#F88A2B] transition-colors">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-slate-100 grid place-items-center">
                  <d.icon className="w-5 h-5 text-slate-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{d.title}</h3>
              </div>
              <p className="text-xs text-slate-500 line-clamp-2">{d.body}</p>
            </a>
          ))}
        </div>
      )}
    </PlatformAdminLayout>
  );
}