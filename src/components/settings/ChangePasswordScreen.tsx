import { useState } from "react";
import { Eye, EyeOff, Lock, Check } from "lucide-react";
import { Phone, SubHeader, card, serifFont } from "./Phone";
import BottomNav from "../BottomNav";
import { useNavigate } from "react-router-dom";
import { AppUserLayout } from "../layouts/AppUserLayout";

const Field = ({ label, value, onChange, show, toggle }: { label: string; value: string; onChange: (v: string) => void; show: boolean; toggle: () => void; }) => (
  <div>
    <label className="text-[11px] font-semibold tracking-[0.12em] text-[#8A8A8A] uppercase">{label}</label>
    <div className="mt-1.5 relative">
      <Lock size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#999]" />
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/80 border border-white/70 rounded-2xl pl-11 pr-11 py-3.5 text-[14px] text-[#111] focus:outline-none focus:ring-2 focus:ring-[#F88A2B]/30 shadow-[0_2px_14px_-8px_rgba(0,0,0,0.06)]"
        placeholder="••••••••"
      />
      <button type="button" onClick={toggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#999] p-1">
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

const Rule = ({ ok, label }: { ok: boolean; label: string }) => (
  <li className="flex items-center gap-2 text-[12px]">
    <span className={`w-4 h-4 rounded-full flex items-center justify-center ${ok ? "bg-[#E3ECDD]" : "bg-[#ECE7E2]"}`}>
      {ok && <Check size={11} className="text-[#8FB17D]" strokeWidth={3} />}
    </span>
    <span className={ok ? "text-[#444]" : "text-[#8A8A8A]"}>{label}</span>
  </li>
);

const ChangePasswordScreen = () => {
  const nav = useNavigate();
  const [cur, setCur] = useState("");
  const [n1, setN1] = useState("");
  const [n2, setN2] = useState("");
  const [s, setS] = useState({ a: false, b: false, c: false });
  const [done, setDone] = useState(false);

  const len = n1.length >= 8;
  const num = /\d/.test(n1);
  const match = n1.length > 0 && n1 === n2;
  const valid = cur.length > 0 && len && num && match;

  return (
    <AppUserLayout>
    <Phone>
      <SubHeader title="Alterar senha" />
      <div className="relative z-10 flex-1 overflow-y-auto px-5 pb-6 scrollbar-hide">
        <div className={`${card} mt-4 py-5 space-y-4`}>
          <Field label="Senha atual" value={cur} onChange={setCur} show={s.a} toggle={() => setS({...s, a: !s.a})} />
          <Field label="Nova senha" value={n1} onChange={setN1} show={s.b} toggle={() => setS({...s, b: !s.b})} />
          <Field label="Confirmar nova senha" value={n2} onChange={setN2} show={s.c} toggle={() => setS({...s, c: !s.c})} />
        </div>

        <div className={`${card} mt-4 py-4`}>
          <p style={serifFont} className="text-[14px] text-[#111] mb-2">Sua senha precisa ter</p>
          <ul className="space-y-1.5">
            <Rule ok={len} label="Pelo menos 8 caracteres" />
            <Rule ok={num} label="Pelo menos 1 número" />
            <Rule ok={match} label="As duas senhas coincidem" />
          </ul>
        </div>

        {done && (
          <div className="mt-4 rounded-2xl bg-[#E3ECDD] border border-[#C9DDC0] px-4 py-3 text-[12.5px] text-[#3F6B45] flex items-center gap-2">
            <Check size={14} /> Senha atualizada com sucesso.
          </div>
        )}

        <button
          disabled={!valid}
          onClick={() => { setDone(true); setTimeout(() => nav("/configuracoes"), 1200); }}
          className="mt-6 w-full rounded-full py-3.5 text-[13px] font-semibold text-white shadow-[0_8px_22px_-10px_rgba(248,138,43,0.6)] disabled:opacity-50 disabled:shadow-none transition-opacity"
          style={{ background: "linear-gradient(180deg, #FF9D4D 0%, #F88A2B 100%)" }}
        >
          Salvar nova senha
        </button>
      </div>
      <BottomNav />
    </Phone>
    </AppUserLayout>
  );
};
export default ChangePasswordScreen;
