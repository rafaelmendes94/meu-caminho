import { LucideIcon, Inbox } from "lucide-react";
import { ReactNode } from "react";

type Props = {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * EmptyState — placeholder padrão para listas/telas sem dados.
 * Use em qualquer tela RH/Enterprise quando a query retornar vazio.
 */
export function EmptyState({ icon: Icon = Inbox, title, description, action, className = "" }: Props) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl bg-white border border-black/5 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F7F4F2] flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-[#F88A2B]" />
      </div>
      <h3 className="text-[16px] font-bold text-[#111]" style={{ fontFamily: "'Playfair Display', serif" }}>
        {title}
      </h3>
      {description && <p className="mt-2 max-w-md text-[13px] text-[#666]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export default EmptyState;