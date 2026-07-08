import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Mail, Check, ShieldCheck } from "lucide-react";
import { Phone, SubHeader, card, serifFont } from "./Phone";
import BottomNav from "../BottomNav";
import { AppUserLayout } from "../layouts/AppUserLayout";



const ChangeEmailScreen = () => {
  const nav = useNavigate();
  const isEnterprise = useLocation().pathname.startsWith('/enterprise');
  const [current] = useState(isEnterprise ? "rafael@enterprise.com" : "juliana@email.com");
  const [next, setNext] = useState("");
  const [pwd, setPwd] = useState("");
  const [done, setDone] = useState(false);
  const valid = /\S+@\S+\.\S+/.test(next) && pwd.length > 0;

  return (
    <AppUserLayout>
    <Phone>
      <SubHeader title="Alterar e-mail" />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
        <div className={`${card} mt-4 py-5`}>
          <p className="text-[11px] font-semibold tracking-[0.12em] text-[#8A8A8A] uppercase">E-mail atual</p>
          <p style={serifFont} className="text-[18px] text-[#111] mt-1">{current}</p>
        </div>

        <div className={`${card} mt-4 py-5 space-y-4`}>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] text-[#8A8A8A] uppercase">Novo e-mail</label>
            <div className="mt-1.5 relative">
              <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
              <input
                type="email" value={next} onChange={(e) => setNext(e.target.value)}
                placeholder="seu@novoemail.com"
                className="w-full bg-white/80 border border-white/70 rounded-2xl pl-11 pr-4 py-3.5 text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/30 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.06)]"
              />
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold tracking-[0.12em] text-[#8A8A8A] uppercase">Confirme com sua senha</label>
            <input
              type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="••••••••"
              className="mt-1.5 w-full bg-white/80 border border-white/70 rounded-2xl px-4 py-3.5 text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/30 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.06)]"
            />
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 px-3 text-[11.5px] text-[#666] leading-snug">
          <ShieldCheck size={14} className="text-[#8FB17D] shrink-0 mt-0.5" />
          Enviaremos um link de confirmação para o novo e-mail antes da alteração ser concluída.
        </div>

        {done && (
          <div className="mt-4 rounded-2xl bg-[#E3ECDD] border border-[#C9DDC0] px-4 py-3 text-[12.5px] text-[#3F6B45] flex items-center gap-2">
            <Check size={14} /> Link de confirmação enviado.
          </div>
        )}

        <button
          disabled={!valid}
          onClick={() => { setDone(true); setTimeout(() => nav("/configuracoes"), 1200); }}
          className="mt-6 w-full rounded-full py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_22px_-10px_rgba(248,138,43,0.6)] disabled:opacity-50 disabled:shadow-none transition-opacity"
          style={{ background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)" }}
        >
          Enviar confirmação
        </button>
      </div>
      <BottomNav />
    </Phone>
    </AppUserLayout>
  );
};
export default ChangeEmailScreen;
