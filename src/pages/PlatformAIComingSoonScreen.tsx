import PlatformAdminLayout from "@/components/layouts/PlatformAdminLayout";
import { Sparkles } from "lucide-react";

type Props = { title: string; description?: string };

export default function PlatformAIComingSoonScreen({ title, description }: Props) {
  return (
    <PlatformAdminLayout>
      <div className="space-y-6">
        <div>
          <p className="text-[11px] uppercase tracking-[0.22em] text-[#F88A2B] font-semibold">Inteligência Artificial</p>
          <h1 className="text-3xl font-bold mt-1">{title}</h1>
        </div>
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-16 text-center">
          <Sparkles className="mx-auto w-10 h-10 text-slate-400" />
          <h2 className="mt-4 text-lg font-semibold text-slate-800">Em breve</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {description ?? "Este módulo será liberado nas próximas fases do editor de IA."}
          </p>
        </div>
      </div>
    </PlatformAdminLayout>
  );
}