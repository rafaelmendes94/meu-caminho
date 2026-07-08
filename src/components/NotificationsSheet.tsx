import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, CalendarDays, Headphones, BookOpen } from "lucide-react";

const serif = { fontFamily: "'Playfair Display', serif" };

type Notif = {
  id: string;
  title: string;
  desc: string;
  time: string;
  Icon: React.ElementType;
  color: string;
  bg: string;
  unread?: boolean;
};

const items: Notif[] = [
  { id: "1", title: "Sequência de 12 dias!", desc: "Você mantém sua sequência de cuidado emocional.", time: "Agora", Icon: Flame, color: "#F88A2B", bg: "#FDECDA", unread: true },
  { id: "2", title: "Resumo semanal", desc: "Veja o seu progresso da semana.", time: "2h", Icon: CalendarDays, color: "#9B8AC9", bg: "#EFEAF7", unread: true },
  { id: "3", title: "Novo áudio do dia", desc: "Uma nova mensagem para sua mente.", time: "1d", Icon: Headphones, color: "#8FB17D", bg: "#E3ECDD" },
  { id: "4", title: "Clube do Livro", desc: "Um novo capítulo foi liberado.", time: "2d", Icon: BookOpen, color: "#B58A5A", bg: "#F6EFE8" },
];

const NotificationsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      requestAnimationFrame(() => setShow(true));
    } else {
      setShow(false);
      const t = setTimeout(() => setMounted(false), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!mounted) return null;

  return (
    <div className="absolute inset-0 z-50" role="dialog" aria-modal="true">
      {/* Light backdrop to dismiss */}
      <button
        aria-label="Fechar"
        onClick={onClose}
        className={`absolute inset-0 bg-black/10 backdrop-blur-[2px] transition-opacity duration-200 ${show ? "opacity-100" : "opacity-0"}`}
      />

      {/* Popover anchored near bell (top-right) */}
      <div
        ref={ref}
        className="absolute right-4 origin-top-right"
        style={{
          top: "calc(env(safe-area-inset-top, 0px) + 78px)",
          width: "min(330px, calc(100% - 32px))",
          transform: show ? "scale(1) translateY(0)" : "scale(0.96) translateY(-6px)",
          opacity: show ? 1 : 0,
          transition: "transform 220ms cubic-bezier(0.22,1,0.36,1), opacity 180ms ease-out",
        }}
      >
        {/* Little arrow / tail */}
        <span
          className="absolute -top-1.5 right-3 w-3 h-3 rotate-45 bg-[#FBF8F5] border-t border-l border-white/80"
          aria-hidden="true"
        />

        <div className="relative rounded-3xl bg-[#FBF8F5]/95 backdrop-blur-2xl border border-white/80 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.25)] overflow-hidden">
          {/* Header */}
          <div className="flex items-end justify-between px-4 pt-3.5 pb-2">
            <div>
              <h2 style={serif} className="text-[18px] leading-none text-[#111] tracking-tight">
                Notificações
              </h2>
              <p className="text-[10.5px] text-[#666] mt-1">Últimas notificações</p>
            </div>
            <span className="text-[10px] font-semibold text-[#F88A2B] bg-[#FDECDA] px-2 py-0.5 rounded-full">
              2 novas
            </span>
          </div>

          {/* List */}
          <div className="max-h-[340px] overflow-y-auto scrollbar-hide divide-y divide-[#F0EAE3] px-2">
            {items.map((n, i) => (
              <button
                key={n.id}
                className="w-full text-left flex items-start gap-2.5 py-2.5 px-2 rounded-xl active:bg-black/[0.02] transition-colors"
                style={{
                  animation: "fadeUp 320ms cubic-bezier(0.22,1,0.36,1) both",
                  animationDelay: `${60 + i * 40}ms`,
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: n.bg }}
                >
                  <n.Icon size={15} color={n.color} strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-[12.5px] font-semibold text-[#111] leading-tight truncate">
                      {n.title}
                    </p>
                    {n.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] shrink-0" />
                    )}
                  </div>
                  <p className="text-[10.5px] text-[#666] mt-0.5 leading-snug line-clamp-2">
                    {n.desc}
                  </p>
                </div>
                <span className="text-[9.5px] text-[#999] shrink-0 mt-0.5">{n.time}</span>
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className="px-3 pt-2 pb-3 border-t border-[#EFE8E0]/70">
            <Link
              to="/notificacoes"
              onClick={onClose}
              className="group flex items-center justify-center gap-1.5 w-full rounded-full py-2.5 bg-white border border-[#EADFCF] text-[12px] font-semibold text-[#111] active:scale-[0.99] transition-transform"
            >
              Ver todas as notificações
              <ArrowRight size={13} className="text-[#F88A2B] transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default NotificationsSheet;
