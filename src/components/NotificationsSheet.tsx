import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Bell, Megaphone } from "lucide-react";
import { useNotifications, formatNotificationTime } from "@/hooks/useNotifications";

const serif = { fontFamily: "'Playfair Display', serif" };

const NotificationsSheet = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [mounted, setMounted] = useState(open);
  const [show, setShow] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { items, unreadCount, markAsRead, markAllAsRead } = useNotifications(10);

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
              <p className="text-[10.5px] text-[#666] mt-1">
                {unreadCount > 0 ? `${unreadCount} não lida${unreadCount === 1 ? "" : "s"}` : "Você está em dia"}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-[10px] font-bold uppercase tracking-widest text-[#F88A2B] hover:underline"
              >
                Marcar todas
              </button>
            )}
          </div>

          {items.length === 0 ? (
            <div className="px-4 py-8 flex flex-col items-center text-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-[#F9F8F6] flex items-center justify-center text-[#C9C2BB]">
                <Bell size={18} />
              </div>
              <p className="text-[12.5px] font-semibold text-[#111]">Sem notificações</p>
              <p className="text-[10.5px] text-[#666] max-w-[220px]">Você não tem novidades no momento.</p>
            </div>
          ) : (
            <div className="max-h-[320px] overflow-y-auto divide-y divide-[#EFE8E0]/70">
              {items.map((n) => {
                const unread = !n.read_at;
                const Icon = n.type === "announcement" ? Megaphone : Bell;
                return (
                  <button
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.action_url) navigate(n.action_url);
                      onClose();
                    }}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-white/70 transition-colors ${unread ? "bg-[#FFF8F0]/60" : ""}`}
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#F88A2B]/10 flex items-center justify-center text-[#F88A2B] shrink-0">
                      <Icon size={15} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-[12px] font-semibold text-[#111] truncate">{n.title}</p>
                        {unread && <span className="w-1.5 h-1.5 rounded-full bg-[#F88A2B] shrink-0" />}
                      </div>
                      {n.body && (
                        <p className="text-[11px] text-[#666] mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-[#999] mt-1">{formatNotificationTime(n.created_at)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

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
