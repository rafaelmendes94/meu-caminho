import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type Profile = {
  summary: string | null;
  confidence: string | null;
  profile_professional: any;
  profile_engagement: any;
  profile_energy: any;
};

export default function OnboardingConcluidoScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("employee_profiles")
        .select("summary,confidence,profile_professional,profile_engagement,profile_energy")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data as Profile | null);
      setLoading(false);
    })();
  }, [user]);

  return (
    <main className="min-h-[100dvh] bg-[#F7F4F2] font-display">
      <div className="max-w-2xl mx-auto px-6 py-10">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#F88A2B] font-bold">Perfil Inteligente</p>
        <h1 className="mt-1 text-[28px] font-black text-[#111] leading-tight">
          Sua jornada começa agora.
        </h1>

        {loading ? (
          <p className="mt-6 text-[#666]">Carregando seu perfil…</p>
        ) : (
          <div className="mt-6 rounded-3xl bg-white border border-[#EFEAE5] p-6">
            <p className="text-[13px] text-[#666] leading-relaxed">
              {profile?.summary || "Seu perfil foi criado com sucesso. Ele será refinado ao longo da sua jornada."}
            </p>

            {profile?.profile_professional?.strengths?.length ? (
              <div className="mt-5">
                <p className="text-[11px] uppercase tracking-[0.15em] font-bold text-[#111]">Suas forças</p>
                <ul className="mt-2 flex flex-wrap gap-2">
                  {profile.profile_professional.strengths.map((s: string, i: number) => (
                    <li key={i} className="px-3 py-1 rounded-full bg-[#F88A2B]/10 text-[#F88A2B] text-[12px] font-semibold">{s}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p className="mt-5 text-[11px] text-[#999] leading-relaxed">
              Este perfil é apenas seu. Não representa diagnóstico clínico e não é exibido individualmente ao RH.
            </p>
          </div>
        )}

        <button
          onClick={() => navigate("/enterprise", { replace: true })}
          className="mt-6 w-full h-[52px] rounded-full bg-[#F88A2B] text-white font-semibold"
        >
          Começar minha jornada
        </button>
      </div>
    </main>
  );
}